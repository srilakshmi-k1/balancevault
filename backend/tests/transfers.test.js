const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('./setup');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

let senderToken, senderAccountId, receiverAccountNumber;

beforeAll(async () => {
  const hash = await bcrypt.hash('Password1', 12);

  // Create sender user + account
  const sender = await prisma.user.create({
    data: { email: 'transfer.sender@example.com', passwordHash: hash, firstName: 'Sender', lastName: 'User', role: 'ACCOUNT_HOLDER' },
  });
  const senderAccount = await prisma.account.create({
    data: { userId: sender.id, accountNumber: 'BVSENDER0001', balance: BigInt(100000), status: 'ACTIVE' },
  });
  senderAccountId = senderAccount.id;

  // Create receiver user + account
  const receiver = await prisma.user.create({
    data: { email: 'transfer.receiver@example.com', passwordHash: hash, firstName: 'Receiver', lastName: 'User', role: 'ACCOUNT_HOLDER' },
  });
  const receiverAccount = await prisma.account.create({
    data: { userId: receiver.id, accountNumber: 'BVRECEIVER001', balance: BigInt(0), status: 'ACTIVE' },
  });
  receiverAccountNumber = receiverAccount.accountNumber;

  const login = await request(app).post('/api/auth/login').send({ email: 'transfer.sender@example.com', password: 'Password1' });
  senderToken = login.body.data.token;
});

describe('Transfers', () => {
  it('completes a valid transfer', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        senderAccountId,
        receiverAccountNumber,
        amountRupees: 100,
        idempotencyKey: uuidv4(),
        note: 'Test payment',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('rejects insufficient balance', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        senderAccountId,
        receiverAccountNumber,
        amountRupees: 9999999,
        idempotencyKey: uuidv4(),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient/i);
  });

  it('rejects negative amount', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        senderAccountId,
        receiverAccountNumber,
        amountRupees: -50,
        idempotencyKey: uuidv4(),
      });

    expect(res.status).toBe(422);
  });

  it('rejects zero amount', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        senderAccountId,
        receiverAccountNumber,
        amountRupees: 0,
        idempotencyKey: uuidv4(),
      });

    expect(res.status).toBe(422);
  });

  it('rejects transfer to same account', async () => {
    const account = await prisma.account.findUnique({ where: { id: senderAccountId } });
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        senderAccountId,
        receiverAccountNumber: account.accountNumber,
        amountRupees: 10,
        idempotencyKey: uuidv4(),
      });

    expect(res.status).toBe(400);
  });

  it('is idempotent – duplicate key returns cached result', async () => {
    const key = uuidv4();
    const payload = { senderAccountId, receiverAccountNumber, amountRupees: 1, idempotencyKey: key };

    const res1 = await request(app).post('/api/transfers').set('Authorization', `Bearer ${senderToken}`).send(payload);
    expect(res1.status).toBe(201);

    const res2 = await request(app).post('/api/transfers').set('Authorization', `Bearer ${senderToken}`).send(payload);
    expect(res2.status).toBe(200);
    expect(res2.body.data.transactionId).toBe(res1.body.data.transactionId);
  });
});
