const express = require('express');
const router = express.Router();
const { getMyLedger, getLedgerByTransaction } = require('../controllers/ledgerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('ACCOUNT_HOLDER', 'ADMIN'), getMyLedger);
router.get('/:transactionId', authenticate, authorize('ACCOUNT_HOLDER', 'ADMIN'), getLedgerByTransaction);

module.exports = router;
