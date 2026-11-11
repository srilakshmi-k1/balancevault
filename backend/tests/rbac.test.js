const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('./setup');
const bcrypt = require('bcryptjs');

let userToken, adminToken, userId, adminId;

beforeAll(async () => {
  // Create regular user
  const hash = await bcrypt.hash('Password1', 12);
  const user = await prisma.user.create({
    data: { email: 'rbac.user@example.com', passwordHash: hash, firstName: 'User', lastName: 'One', role: 'ACCOUNT_HOLDER' },
  });
  userId = user.id;

  // Create admin
  const admin = await prisma.user.create({
    data: { email: 'rbac.admin@example.com', passwordHash: hash, firstName: 'Admin', lastName: 'One', role: 'ADMIN' },
  });
  adminId = admin.id;

  const userLogin = await request(app).post('/api/auth/login').send({ email: 'rbac.user@example.com', password: 'Password1' });
  userToken = userLogin.body.data.token;

  const adminLogin = await request(app).post('/api/auth/login').send({ email: 'rbac.admin@example.com', password: 'Password1' });
  adminToken = adminLogin.body.data.token;
});

describe('RBAC', () => {
  it('user cannot access admin dashboard', async () => {
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('user cannot access admin user list', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('user cannot access admin audit logs', async () => {
    const res = await request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('user cannot approve onboarding', async () => {
    // Create a dummy onboarding for the admin user
    const onboarding = await prisma.onboarding.create({
      data: {
        userId: adminId,
        phone: '9999999999',
        address: '123 Main St',
        dateOfBirth: new Date('1990-01-01'),
        occupation: 'Engineer',
        annualIncome: BigInt(500000),
        idType: 'PAN',
        idNumber: 'ABCDE1234F',
      },
    });

    const res = await request(app)
      .patch(`/api/admin/onboarding/${onboarding.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(403);
  });

  it('admin can access dashboard', async () => {
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('unauthenticated request blocked', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
