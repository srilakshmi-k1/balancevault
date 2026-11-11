const { body, param } = require('express-validator');

const submitOnboardingValidation = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('occupation').trim().notEmpty().withMessage('Occupation is required'),
  body('annualIncome').isNumeric().withMessage('Annual income must be a number'),
  body('idType').isIn(['AADHAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE']).withMessage('Invalid ID type'),
  body('idNumber').trim().notEmpty().withMessage('ID number is required'),
];

const reviewOnboardingValidation = [
  param('id').isUUID().withMessage('Invalid onboarding ID'),
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  body('reviewNote').optional().trim(),
];

module.exports = { submitOnboardingValidation, reviewOnboardingValidation };
