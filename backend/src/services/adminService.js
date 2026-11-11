const prisma = require('../utils/prisma');

async function getDashboardStats() {
  const [
    totalUsers,
    activeAccounts,
    pendingOnboarding,
    totalTransactions,
    recentTransactions,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'ACCOUNT_HOLDER' } }),
    prisma.account.count({ where: { status: 'ACTIVE' } }),
    prisma.onboarding.count({ where: { status: 'PENDING' } }),
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'COMPLETED' },
      include: {
        senderAccount: { select: { accountNumber: true } },
        receiverAccount: { select: { accountNumber: true } },
        sender: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { email: true, firstName: true, lastName: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    activeAccounts,
    pendingOnboarding,
    totalTransactions,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      amountRupees: Number(t.amountPaise) / 100,
    })),
    recentAuditLogs,
  };
}

async function getAllUsers({ page = 1, limit = 20, role, search } = {}) {
  const where = {
    ...(role ? { role } : {}),
    ...(search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  };

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        onboarding: { select: { status: true } },
        accounts: { select: { id: true, accountNumber: true, status: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

async function getAuditLogs({ page = 1, limit = 20, action, actorId } = {}) {
  const where = {
    ...(action ? { action } : {}),
    ...(actorId ? { actorId } : {}),
  };

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit };
}

module.exports = { getDashboardStats, getAllUsers, getAuditLogs };
