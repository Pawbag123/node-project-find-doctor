import { body } from 'express-validator';

import { validateResults } from '../middleware/validation-middleware';

export const validateSpecialtyInput = validateResults([
  body('name')
    .notEmpty()
    .withMessage('Specialty name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Specialty name must contain only letters and spaces'),
]);
