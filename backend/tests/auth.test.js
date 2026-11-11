const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('./setup');

describe('Authentication', () => {
  const userPayload = {
    email: 'test.auth@example.com',
    password: 'Password1',
    firstName: 'Test',
    lastName: 'User',
  };

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(userPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userPayload.email);
      expect(res.body.data.role).toBe('ACCOUNT_HOLDER');
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('rejects duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(userPayload);
      expect(res.status).toBe(409);
    });

    it('rejects weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...userPayload,
        email: 'other@example.com',
        password: 'weak',
      });
      expect(res.status).toBe(422);
    });

    it('rejects invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...userPayload,
        email: 'not-an-email',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userPayload.email,
        password: userPayload.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(userPayload.email);
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userPayload.email,
        password: 'WrongPassword1',
      });
      expect(res.status).toBe(401);
    });

    it('rejects non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'Password1',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userPayload.email,
        password: userPayload.password,
      });
      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(userPayload.email);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
