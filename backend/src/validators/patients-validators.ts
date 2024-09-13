import { body } from 'express-validator';
import { validateResults } from '../middleware/validation-middleware';

export const validatePatientInput = validateResults([
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  ,
  body('age')
    .notEmpty()
    .withMessage('Age is required')
    .matches(/^[0-9]+$/)
    .withMessage('Age must be a number')
    .isInt({ min: 18, max: 130 })
    .withMessage('Age must be a valid value. Minimum age is 18'),
]);
