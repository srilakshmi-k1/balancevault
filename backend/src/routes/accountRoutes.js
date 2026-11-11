const express = require('express');
const router = express.Router();
const { getMyAccounts, getAccount } = require('../controllers/accountController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('ACCOUNT_HOLDER', 'ADMIN'), getMyAccounts);
router.get('/:id', authenticate, authorize('ACCOUNT_HOLDER', 'ADMIN'), getAccount);

module.exports = router;
