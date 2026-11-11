const prisma = require('../utils/prisma');
const { recordAudit } = require('./auditService');

function formatAccount(account) {
  return {
    ...account,
    balance: account.balance !== undefined ? Number(account.balance) / 100 : undefined,
  };
}

async function getAccountsForUser(userId) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return accounts.map(formatAccount);
}

async function getAccountById(accountId, userId, role) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  if (!account) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }

  // Non-admins can only see their own accounts
  if (role !== 'ADMIN' && account.userId !== userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  return formatAccount(account);
}

async function getAllAccounts({ status, page = 1, limit = 20 }) {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.account.count({ where }),
  ]);

  return { accounts: accounts.map(formatAccount), total, page, limit };
}

async function updateAccountStatus(accountId, adminId, { status }, requestContext) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.account.update({
    where: { id: accountId },
    data: { status },
  });

  await recordAudit({
    actorId: adminId,
    action: 'ACCOUNT_STATUS_CHANGED',
    targetType: 'Account',
    targetId: accountId,
    outcome: 'SUCCESS',
    ...requestContext,
    metadata: { previousStatus: account.status, newStatus: status },
  });

  return formatAccount(updated);
}

module.exports = { getAccountsForUser, getAccountById, getAllAccounts, updateAccountStatus };
