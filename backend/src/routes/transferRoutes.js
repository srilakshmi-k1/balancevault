const express = require('express');
const router = express.Router();
const { transfer, getMyTransactions, getTransaction } = require('../controllers/transferController');
const { transferValidation } = require('../validators/transferValidators');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { transferLimiter } = require('../middleware/rateLimiter');

router.post('/', authenticate, authorize('ACCOUNT_HOLDER'), transferLimiter, transferValidation, validate, transfer);
router.get('/', authenticate, authorize('ACCOUNT_HOLDER', 'ADMIN'), getMyTransactions);
router.get('/:id', authenticate, authorize('ACCOUNT_HOLDER', 'ADMIN'), getTransaction);

module.exports = router;
