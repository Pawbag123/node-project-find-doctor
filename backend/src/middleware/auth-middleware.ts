import { RequestHandler } from 'express';
import dotenv from 'dotenv';

import { HttpError } from '../models/http-error';
import { TokenAuthorization } from '../utils/token-authorization';

dotenv.config();

export const checkAuthUser: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new HttpError('Authentication failed!', 401));
  }

  const token = req.headers.authorization.split(' ')[1]; // Authorization
  if (!token) {
    return next(new HttpError('Authentication failed!', 401));
  }

  let decodedToken;
  try {
    decodedToken = TokenAuthorization.verify(token, process.env.TOKEN_SECRET);
  } catch (err) {
    return next(new HttpError(`Authentication failed! ${err.message}`, 401));
  }

  res.locals.userData = decodedToken;

  next();
};

export const checkAuthPatient: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new HttpError('Authentication failed!', 401));
  }

  const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
  if (!token) {
    return next(new HttpError('Authentication failed!', 401));
  }

  let decodedToken;
  try {
    decodedToken = TokenAuthorization.verify(token, process.env.TOKEN_SECRET);
  } catch (err) {
    return next(new HttpError(`Authentication failed! ${err.message}`, 401));
  }

  if (decodedToken.role !== 'patient') {
    return next(new HttpError('Access denied, patient role required', 403));
  }

  res.locals.userData = decodedToken;

  next();
};

export const checkAuthDoctor: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new HttpError('Authentication failed!', 401));
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(new HttpError('Authentication failed!', 401));
  }

  let decodedToken;
  try {
    decodedToken = TokenAuthorization.verify(token, process.env.TOKEN_SECRET);
  } catch (err) {
    return next(new HttpError(`Authentication failed! ${err.message}`, 401));
  }

  if (decodedToken.role !== 'doctor') {
    return next(new HttpError('Access denied, doctor role required', 403));
  }

  res.locals.userData = decodedToken;

  next();
};

export const checkAuthDoctorParam: RequestHandler = (req, res, next) => {
  const doctorId = req.params.did;
  const userData = res.locals.userData;
  if (userData.role !== 'doctor') {
    return next(new HttpError('Access denied, doctor role required', 403));
  }

  if (userData.profileId !== doctorId) {
    return next(new HttpError('Access denied, you are not allowed', 403));
  }

  next();
};

export const checkAuthPatientParam: RequestHandler = (req, res, next) => {
  const patientId = req.params.pid;
  const userData = res.locals.userData;
  if (userData.role !== 'patient') {
    return next(new HttpError('Access denied, patient role required', 403));
  }
  if (userData.profileId !== patientId) {
    return next(new HttpError('Access denied, you are not allowed', 403));
  }

  next();
};

export const checkAuthUserParam: RequestHandler = (req, res, next) => {
  const userId = req.params.uid;
  const userData = res.locals.userData;

  if (userData.userId !== userId) {
    return next(new HttpError('Access denied, you are not allowed', 403));
  }

  next();
};
