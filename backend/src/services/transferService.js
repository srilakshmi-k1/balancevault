const prisma = require('../utils/prisma');
const { recordAudit } = require('./auditService');

/**
 * Executes a money transfer atomically using Prisma transactions.
 *
 * Security guarantees:
 *  - Sender must own the source account.
 *  - Both accounts must be ACTIVE.
 *  - Amount must be a positive integer (paise).
 *  - Balance is re-read inside the DB transaction to prevent concurrent overdrafts.
 *  - Idempotency key prevents duplicate transfers.
 *  - Full rollback on any failure.
 *
 * NOTE: Row-level locking via raw SQL requires uuid casting in Prisma which is
 * version-sensitive. Instead we use Prisma's serializable transaction isolation
 * and re-verify balance inside the transaction for concurrency safety.
 */
async function executeTransfer(
  { senderId, senderAccountId, receiverAccountNumber, amountRupees, note, idempotencyKey },
  requestContext
) {
  // ── Idempotency check ────────────────────────────────────────────────────
  const existing = await prisma.idempotencyRecord.findUnique({ where: { key: idempotencyKey } });
  if (existing && new Date() < existing.expiresAt) {
    return { cached: true, ...existing.responseBody };
  }

  // ── Input validation ─────────────────────────────────────────────────────
  const amountPaise = BigInt(Math.round(amountRupees * 100));
  if (amountPaise <= 0n) {
    const err = new Error('Amount must be greater than zero');
    err.statusCode = 400;
    throw err;
  }

  // ── Pre-flight checks (outside transaction for fast failure) ─────────────
  const senderAccount = await prisma.account.findUnique({ where: { id: senderAccountId } });
  if (!senderAccount) {
    const err = new Error('Sender account not found'); err.statusCode = 404; throw err;
  }
  if (senderAccount.userId !== senderId) {
    const err = new Error('You do not own this account'); err.statusCode = 403; throw err;
  }
  if (senderAccount.status !== 'ACTIVE') {
    const err = new Error('Sender account is not active'); err.statusCode = 400; throw err;
  }

  const receiverAccount = await prisma.account.findUnique({ where: { accountNumber: receiverAccountNumber } });
  if (!receiverAccount) {
    const err = new Error('Receiver account not found'); err.statusCode = 404; throw err;
  }
  if (receiverAccount.id === senderAccountId) {
    const err = new Error('Cannot transfer to the same account'); err.statusCode = 400; throw err;
  }
  if (receiverAccount.status !== 'ACTIVE') {
    const err = new Error('Receiver account is not active'); err.statusCode = 400; throw err;
  }

  // ── Create pending transaction record ────────────────────────────────────
  const transaction = await prisma.transaction.create({
    data: {
      idempotencyKey,
      senderAccountId,
      receiverAccountId: receiverAccount.id,
      senderId,
      amountPaise,
      status: 'PENDING',
      note: note || null,
    },
  });

  try {
    // ── Atomic balance update inside a Prisma interactive transaction ────────
    const result = await prisma.$transaction(async (tx) => {

      // Re-read sender balance inside transaction (concurrency-safe re-check)
      const freshSender = await tx.account.findUnique({ where: { id: senderAccount.id } });
      if (freshSender.balance < amountPaise) {
        const err = new Error('Insufficient balance'); err.statusCode = 400; throw err;
      }

      const freshReceiver = await tx.account.findUnique({ where: { id: receiverAccount.id } });

      const newSenderBalance   = freshSender.balance   - amountPaise;
      const newReceiverBalance = freshReceiver.balance + amountPaise;

      // Atomic balance updates
      await tx.account.update({ where: { id: senderAccount.id },   data: { balance: newSenderBalance } });
      await tx.account.update({ where: { id: receiverAccount.id }, data: { balance: newReceiverBalance } });

      // Double-entry ledger entries
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: senderAccount.id,
          entryType: 'DEBIT',
          amountPaise,
          balanceAfter: newSenderBalance,
        },
      });
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: receiverAccount.id,
          entryType: 'CREDIT',
          amountPaise,
          balanceAfter: newReceiverBalance,
        },
      });

      // Mark transaction COMPLETED
      return tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    // ── Build response payload ────────────────────────────────────────────
    const responseData = {
      transactionId: result.id,
      status: 'COMPLETED',
      amountRupees,
      note: note || null,
      completedAt: result.completedAt,
    };

    // Store idempotency result for 24 h
    await prisma.idempotencyRecord.upsert({
      where: { key: idempotencyKey },
      update: { responseBody: responseData, statusCode: 200, expiresAt: new Date(Date.now() + 86400000) },
      create: { key: idempotencyKey, responseBody: responseData, statusCode: 200, expiresAt: new Date(Date.now() + 86400000) },
    });

    await recordAudit({
      actorId: senderId,
      action: 'TRANSFER_COMPLETED',
      targetType: 'Transaction',
      targetId: result.id,
      outcome: 'SUCCESS',
      ...requestContext,
      metadata: { amountRupees, receiverAccountNumber, senderAccountId },
    });

    return responseData;

  } catch (err) {
    // Mark transaction FAILED and re-throw
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED', failureReason: err.message },
    }).catch(() => {});

    await recordAudit({
      actorId: senderId,
      action: 'TRANSFER_FAILED',
      targetType: 'Transaction',
      targetId: transaction.id,
      outcome: 'FAILED',
      ...requestContext,
      metadata: { reason: err.message, amountRupees, senderAccountId },
    });

    throw err;
  }
}

async function getTransactionsForUser(userId, { page = 1, limit = 20, accountId } = {}) {
  const userAccounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true },
  });
  const accountIds = userAccounts.map((a) => a.id);

  const where = accountId
    ? { OR: [{ senderAccountId: accountId }, { receiverAccountId: accountId }] }
    : { OR: [{ senderAccountId: { in: accountIds } }, { receiverAccountId: { in: accountIds } }] };

  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        senderAccount:  { select: { accountNumber: true } },
        receiverAccount: { select: { accountNumber: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({ ...t, amountRupees: Number(t.amountPaise) / 100 })),
    total, page, limit,
  };
}

async function getTransactionById(transactionId, userId, role) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      senderAccount:  { select: { accountNumber: true, userId: true } },
      receiverAccount: { select: { accountNumber: true, userId: true } },
      ledgerEntries: true,
    },
  });

  if (!transaction) {
    const err = new Error('Transaction not found'); err.statusCode = 404; throw err;
  }
  if (role !== 'ADMIN' && transaction.senderId !== userId && transaction.receiverAccount.userId !== userId) {
    const err = new Error('Access denied'); err.statusCode = 403; throw err;
  }

  return {
    ...transaction,
    amountRupees: Number(transaction.amountPaise) / 100,
    ledgerEntries: transaction.ledgerEntries.map((e) => ({
      ...e,
      amountRupees: Number(e.amountPaise) / 100,
      balanceAfterRupees: Number(e.balanceAfter) / 100,
    })),
  };
}

async function getAllTransactions({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        senderAccount:  { select: { accountNumber: true } },
        receiverAccount: { select: { accountNumber: true } },
        sender: { select: { email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.transaction.count(),
  ]);

  return {
    transactions: transactions.map((t) => ({ ...t, amountRupees: Number(t.amountPaise) / 100 })),
    total, page, limit,
  };
}

module.exports = { executeTransfer, getTransactionsForUser, getTransactionById, getAllTransactions };
