import { body } from 'express-validator';

import Specialty from '../models/specialty';
import {
  validateIdChain,
  validateResults,
} from '../middleware/validation-middleware';

export const validateCauseInput = validateResults([
  body('name').notEmpty().withMessage('Name is required'),
  body('specialtyId')
    .notEmpty()
    .withMessage('Specialty ID is required')
    .custom(validateIdChain('specialtyId', Specialty)),
]);
