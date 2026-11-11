const prisma = require('../utils/prisma');
const { recordAudit } = require('./auditService');
const { generateAccountNumber } = require('../utils/accountNumber');

/** Convert any BigInt fields to numbers so JSON serialization works */
function safeOnboarding(o) {
  if (!o) return o;
  return {
    ...o,
    annualIncome: o.annualIncome !== undefined ? Number(o.annualIncome) : undefined,
  };
}

async function submitOnboarding(userId, data, requestContext) {
  const existing = await prisma.onboarding.findUnique({ where: { userId } });
  if (existing) {
    const err = new Error('Onboarding already submitted');
    err.statusCode = 409;
    throw err;
  }

  const onboarding = await prisma.onboarding.create({
    data: {
      userId,
      phone: data.phone,
      address: data.address,
      dateOfBirth: new Date(data.dateOfBirth),
      occupation: data.occupation,
      annualIncome: BigInt(Math.round(Number(data.annualIncome) * 100)),
      idType: data.idType,
      idNumber: data.idNumber,
    },
  });

  await recordAudit({
    actorId: userId,
    action: 'ONBOARDING_SUBMITTED',
    targetType: 'Onboarding',
    targetId: onboarding.id,
    outcome: 'SUCCESS',
    ...requestContext,
  });

  return safeOnboarding(onboarding);
}

async function getOnboardingStatus(userId) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { userId },
    select: {
      id: true, status: true, submittedAt: true, reviewedAt: true,
      reviewNote: true, phone: true, address: true, occupation: true,
      dateOfBirth: true, idType: true,
    },
  });
  return onboarding; // no BigInt fields in this select
}

async function listOnboardings({ status, page = 1, limit = 20 }) {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.onboarding.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.onboarding.count({ where }),
  ]);

  // Convert BigInt annualIncome for each record
  return { records: records.map(safeOnboarding), total, page, limit };
}

async function reviewOnboarding(onboardingId, adminId, { status, reviewNote }, requestContext) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { id: onboardingId },
    include: { user: true },
  });

  if (!onboarding) {
    const err = new Error('Onboarding record not found');
    err.statusCode = 404;
    throw err;
  }

  if (onboarding.status !== 'PENDING') {
    const err = new Error('Onboarding already reviewed');
    err.statusCode = 409;
    throw err;
  }

  const updatedOnboarding = await prisma.$transaction(async (tx) => {
    const updated = await tx.onboarding.update({
      where: { id: onboardingId },
      data: { status, reviewNote, reviewedBy: adminId, reviewedAt: new Date() },
    });

    // Auto-create account on approval
    if (status === 'APPROVED') {
      let accountNumber;
      let attempts = 0;
      do {
        accountNumber = generateAccountNumber();
        const exists = await tx.account.findUnique({ where: { accountNumber } });
        if (!exists) break;
        attempts++;
      } while (attempts < 5);

      await tx.account.create({
        data: {
          userId: onboarding.userId,
          accountNumber,
          balance: BigInt(0),
          status: 'ACTIVE',
        },
      });
    }

    return updated;
  });

  await recordAudit({
    actorId: adminId,
    action: status === 'APPROVED' ? 'ONBOARDING_APPROVED' : 'ONBOARDING_REJECTED',
    targetType: 'Onboarding',
    targetId: onboardingId,
    outcome: 'SUCCESS',
    ...requestContext,
    metadata: { reviewNote, affectedUserId: onboarding.userId },
  });

  return safeOnboarding(updatedOnboarding);
}

module.exports = { submitOnboarding, getOnboardingStatus, listOnboardings, reviewOnboarding };
