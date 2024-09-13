import { Request, Response, NextFunction } from 'express';

import { HttpError } from '../models/http-error';

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new HttpError('Could not find this route', 404));
};

export const errorHandlerMiddleware = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
};
