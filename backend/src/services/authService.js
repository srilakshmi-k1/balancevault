const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { recordAudit } = require('./auditService');

const SALT_ROUNDS = 12;

async function registerUser({ email, password, firstName, lastName }, requestContext) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: 'ACCOUNT_HOLDER' },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  });

  await recordAudit({
    actorId: user.id,
    action: 'USER_REGISTERED',
    targetType: 'User',
    targetId: user.id,
    outcome: 'SUCCESS',
    ...requestContext,
    metadata: { email },
  });

  return user;
}

async function loginUser({ email, password }, requestContext) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await recordAudit({
      action: 'LOGIN_FAILED',
      targetType: 'User',
      outcome: 'FAILED',
      ...requestContext,
      metadata: { email, reason: 'User not found' },
    });
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await recordAudit({
      actorId: user.id,
      action: 'LOGIN_FAILED',
      targetType: 'User',
      targetId: user.id,
      outcome: 'FAILED',
      ...requestContext,
      metadata: { reason: 'Wrong password' },
    });
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  await recordAudit({
    actorId: user.id,
    action: 'LOGIN_SUCCESS',
    targetType: 'User',
    targetId: user.id,
    outcome: 'SUCCESS',
    ...requestContext,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      onboarding: {
        select: { status: true, submittedAt: true, reviewedAt: true },
      },
    },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

module.exports = { registerUser, loginUser, getCurrentUser };
