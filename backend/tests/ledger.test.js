const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('./setup');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { verifyLedgerIntegrity } = require('../src/services/ledgerService');

let token, senderAccountId, receiverAccountNumber;

beforeAll(async () => {
  const hash = await bcrypt.hash('Password1', 12);

  const sender = await prisma.user.create({
    data: { email: 'ledger.sender@example.com', passwordHash: hash, firstName: 'Ledger', lastName: 'Sender', role: 'ACCOUNT_HOLDER' },
  });
  const senderAccount = await prisma.account.create({
    data: { userId: sender.id, accountNumber: 'BVLEDGER0001', balance: BigInt(50000), status: 'ACTIVE' },
  });
  senderAccountId = senderAccount.id;

  const receiver = await prisma.user.create({
    data: { email: 'ledger.receiver@example.com', passwordHash: hash, firstName: 'Ledger', lastName: 'Receiver', role: 'ACCOUNT_HOLDER' },
  });
  const receiverAccount = await prisma.account.create({
    data: { userId: receiver.id, accountNumber: 'BVLEDGER0002', balance: BigInt(0), status: 'ACTIVE' },
  });
  receiverAccountNumber = receiverAccount.accountNumber;

  const login = await request(app).post('/api/auth/login').send({ email: 'ledger.sender@example.com', password: 'Password1' });
  token = login.body.data.token;
});

describe('Ledger', () => {
  it('creates matching debit and credit entries for a transfer', async () => {
    const transferRes = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${token}`)
      .send({ senderAccountId, receiverAccountNumber, amountRupees: 50, idempotencyKey: uuidv4() });

    expect(transferRes.status).toBe(201);
    const txId = transferRes.body.data.transactionId;

    const entries = await prisma.ledgerEntry.findMany({ where: { transactionId: txId } });
    expect(entries).toHaveLength(2);

    const debit = entries.find((e) => e.entryType === 'DEBIT');
    const credit = entries.find((e) => e.entryType === 'CREDIT');

    expect(debit).toBeDefined();
    expect(credit).toBeDefined();
    expect(debit.amountPaise).toBe(credit.amountPaise);
  });

  it('passes ledger integrity verification', async () => {
    const result = await verifyLedgerIntegrity();
    expect(result.verified).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
