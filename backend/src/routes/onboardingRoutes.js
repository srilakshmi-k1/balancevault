const express = require('express');
const router = express.Router();
const { submit, getStatus } = require('../controllers/onboardingController');
const { submitOnboardingValidation } = require('../validators/onboardingValidators');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/', authenticate, authorize('ACCOUNT_HOLDER'), submitOnboardingValidation, validate, submit);
router.get('/status', authenticate, authorize('ACCOUNT_HOLDER'), getStatus);

module.exports = router;
