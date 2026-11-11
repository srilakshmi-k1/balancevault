const { body } = require('express-validator');

const transferValidation = [
  body('senderAccountId').isUUID().withMessage('Valid sender account ID is required'),
  body('receiverAccountNumber').trim().notEmpty().withMessage('Receiver account number is required'),
  body('amountRupees')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0'),
  body('idempotencyKey').trim().notEmpty().withMessage('Idempotency key is required'),
  body('note').optional().trim().isLength({ max: 200 }).withMessage('Note too long'),
];

module.exports = { transferValidation };
