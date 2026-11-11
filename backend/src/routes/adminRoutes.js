const express = require('express');
const router = express.Router();
const { dashboard, users, auditLogs } = require('../controllers/adminController');
const { list: listOnboardings, review: reviewOnboarding } = require('../controllers/onboardingController');
const { listAllAccounts, changeAccountStatus } = require('../controllers/accountController');
const { listAllTransactions } = require('../controllers/transferController');
const { verifyIntegrity } = require('../controllers/ledgerController');
const { reviewOnboardingValidation } = require('../validators/onboardingValidators');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');

const adminOnly = [authenticate, authorize('ADMIN')];

router.get('/dashboard', ...adminOnly, dashboard);
router.get('/users', ...adminOnly, users);
router.get('/audit-logs', ...adminOnly, auditLogs);
router.get('/transactions', ...adminOnly, listAllTransactions);

// Onboarding management
router.get('/onboarding', ...adminOnly, listOnboardings);
router.patch('/onboarding/:id', ...adminOnly, reviewOnboardingValidation, validate, reviewOnboarding);

// Account management
router.get('/accounts', ...adminOnly, listAllAccounts);
router.patch(
  '/accounts/:id/status',
  ...adminOnly,
  [body('status').isIn(['ACTIVE', 'SUSPENDED', 'PENDING']).withMessage('Invalid status')],
  validate,
  changeAccountStatus
);

// Ledger verification
router.get('/ledger/verify', ...adminOnly, verifyIntegrity);

module.exports = router;
