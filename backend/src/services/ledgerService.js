const prisma = require('../utils/prisma');

async function getLedgerForUser(userId, { page = 1, limit = 20 } = {}) {
  const userAccounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true },
  });
  const accountIds = userAccounts.map((a) => a.id);

  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: { accountId: { in: accountIds } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: { select: { idempotencyKey: true, status: true, note: true } },
        account: { select: { accountNumber: true } },
      },
    }),
    prisma.ledgerEntry.count({ where: { accountId: { in: accountIds } } }),
  ]);

  return {
    entries: entries.map(formatEntry),
    total,
    page,
    limit,
  };
}

async function getLedgerForTransaction(transactionId, userId, role) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { senderAccount: { select: { userId: true } } },
  });

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }

  if (role !== 'ADMIN' && transaction.senderAccount.userId !== userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const entries = await prisma.ledgerEntry.findMany({
    where: { transactionId },
    include: { account: { select: { accountNumber: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return entries.map(formatEntry);
}

/**
 * Verifies ledger integrity:
 *  1. Every COMPLETED transaction must have exactly one DEBIT and one CREDIT entry.
 *  2. Debit and credit amounts for the same transaction must be equal.
 */
async function verifyLedgerIntegrity() {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'COMPLETED' },
    include: { ledgerEntries: true },
  });

  const issues = [];

  for (const tx of transactions) {
    const debits = tx.ledgerEntries.filter((e) => e.entryType === 'DEBIT');
    const credits = tx.ledgerEntries.filter((e) => e.entryType === 'CREDIT');

    if (debits.length !== 1 || credits.length !== 1) {
      issues.push({
        transactionId: tx.id,
        issue: `Expected 1 debit and 1 credit, found ${debits.length} debits and ${credits.length} credits`,
      });
      continue;
    }

    if (debits[0].amountPaise !== credits[0].amountPaise) {
      issues.push({
        transactionId: tx.id,
        issue: `Debit amount (${debits[0].amountPaise}) does not match credit amount (${credits[0].amountPaise})`,
      });
    }
  }

  return {
    totalChecked: transactions.length,
    issuesFound: issues.length,
    issues,
    verified: issues.length === 0,
    checkedAt: new Date(),
  };
}

function formatEntry(entry) {
  return {
    ...entry,
    amountRupees: Number(entry.amountPaise) / 100,
    balanceAfterRupees: Number(entry.balanceAfter) / 100,
  };
}

module.exports = { getLedgerForUser, getLedgerForTransaction, verifyLedgerIntegrity };
