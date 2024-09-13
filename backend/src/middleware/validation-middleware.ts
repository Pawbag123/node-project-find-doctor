import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  ValidationChain,
  validationResult,
  CustomValidator,
} from 'express-validator';

import { HttpError } from '../models/http-error';

/**
 * Middleware to validate the results of the validation chain
 * @param validateValues - The validation chain to check
 * @returns  - Middleware function that runs the validation chain
 */
export const validateResults = (validateValues: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validateValues.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // const errorMessages = errors.array().map((error) => error.msg);
      return next(
        new HttpError(`Invalid inputs passed: ${errors.array()[0].msg}`, 422)
        // new HttpError(`Invalid inputs passed: ${errorMessages.join(', ')}`, 422)
      );
    }
    next();
  };
};

/**
 * Function that validates id passed as the parameter
 * @param paramName - The name of the parameter to validate
 * @param model - The mongoose model to check the id against
 * @returns - Middleware function that validates the id
 */
export const validateIdParam = (
  paramName: string,
  model?: mongoose.Model<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError(`Invalid ${paramName}`, 400));
    }

    if (model) {
      try {
        const resource = await model.findById(id);
        if (!resource) {
          return next(new HttpError(`${paramName} not found`, 404));
        }
      } catch (err) {
        console.error(err);
        return next(
          new HttpError(`Fetching ${paramName} failed, please try again`, 500)
        );
      }
    }

    next();
  };
};

/**
 * Function that creates custom validator to be used in the validation chain
 * to check if the id is valid and exists in the database
 * @param paramName - The name of the parameter to validate
 * @param model - The mongoose model to check the id against
 * @returns - Custom validator function that validates the id
 */
export const validateIdChain = (
  paramName: string,
  model?: mongoose.Model<any>
): CustomValidator => {
  return async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(`Invalid ${paramName}`, 422);
    }

    if (model) {
      const resource = await model.findById(id);
      if (!resource) {
        throw new HttpError(`${paramName} not found`, 404);
      }
    }
  };
};
