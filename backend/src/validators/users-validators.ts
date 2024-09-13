import { body } from 'express-validator';

import { validateResults } from '../middleware/validation-middleware';
import { HttpError } from '../models/http-error';
import User from '../models/user';

export const validateUserInput = validateResults([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new HttpError('Email already exists', 422);
      }
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
]);

export const validateLoginInput = validateResults([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password').notEmpty().withMessage('password is required'),
]);
