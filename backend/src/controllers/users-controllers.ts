import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import { UserRole } from '../types';
import Doctor from '../models/doctor';
import Patient from '../models/patient';
import User from '../models/user';
import { HttpError } from '../models/http-error';
import { getCoordsForAddress } from '../utils/location';
import { TokenAuthorization } from '../utils/token-authorization';
import { defaultTokenOptions } from '../utils/default-values';

dotenv.config();

// const getUsers: RequestHandler = (req, res) => {
//   res.json({ message: 'GET /users' });
// };

const signupAsDoctor: RequestHandler = async (req, res, next) => {
  const {
    name,
    email,
    image,
    password,
    address,
    specialtyId,
    causes,
    availability,
  } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not create user, please try again', 500));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const createdDoctor = new Doctor({
    image,
    name,
    address,
    specialtyId,
    causes,
    location: {
      type: 'Point',
      coordinates: [coordinates.lat, coordinates.lng],
    },
    availability,
    appointments: [],
  });

  let createdUser;

  try {
    await createdDoctor.save({ session });

    createdUser = new User({
      email,
      role: UserRole.Doctor,
      password: hashedPassword,
      doctorProfileId: createdDoctor._id,
    });

    await createdUser.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return next(new HttpError('Creating user failed, please try again', 500));
  }

  const tokenPayload = {
    userId: createdUser.id,
    role: createdUser.role,
    profileId: createdUser.doctorProfileId,
  };
  const tokenSecret = process.env.TOKEN_SECRET;
  const token = TokenAuthorization.sign({
    payload: tokenPayload,
    secret: tokenSecret,
    options: defaultTokenOptions,
  });

  res.status(201).json({
    userId: createdUser.id,
    role: createdUser.role,
    profileId: createdUser.doctorProfileId,
    token,
  });
};

const signupAsPatient: RequestHandler = async (req, res, next) => {
  const { email, password, name, age } = req.body;

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not create user, please try again', 500));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const createdPatient = new Patient({
    name,
    age,
    appointments: [],
  });

  let createdUser;
  try {
    await createdPatient.save({ session });

    createdUser = new User({
      email,
      role: UserRole.Patient,
      password: hashedPassword,
      patientProfileId: createdPatient._id,
    });

    await createdUser.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    return next(new HttpError('Creating user failed, please try again', 500));
  }

  const tokenPayload = {
    userId: createdUser.id,
    role: createdUser.role,
    profileId: createdUser.patientProfileId,
  };
  const tokenSecret = process.env.TOKEN_SECRET;
  const token = TokenAuthorization.sign({
    payload: tokenPayload,
    secret: tokenSecret,
    options: defaultTokenOptions,
  });

  res.status(201).json({
    userId: createdUser.id,
    role: createdUser.role,
    profileId: createdUser.patientProfileId,
    token,
  });
};

const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({
      email,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Logging in failed, please try again later', 500)
    );
  }

  if (!identifiedUser) {
    return next(
      new HttpError('Wrong credentials, user could not be identified', 401)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        'Logging in failed, check credentials and try again later',
        500
      )
    );
  }

  if (!isValidPassword) {
    return next(new HttpError('Wrong password, check your credentials', 401));
  }

  const tokenPayload = {
    userId: identifiedUser.id,
    role: identifiedUser.role,
    profileId:
      identifiedUser.doctorProfileId || identifiedUser.patientProfileId,
  };
  const tokenSecret = process.env.TOKEN_SECRET;
  const token = TokenAuthorization.sign({
    payload: tokenPayload,
    secret: tokenSecret,
    options: defaultTokenOptions,
  });

  res.json({
    userId: identifiedUser.id,
    role: identifiedUser.role,
    profileId:
      identifiedUser.doctorProfileId || identifiedUser.patientProfileId,
    token,
  });
};

// const deleteUser: RequestHandler = (req, res) => {
//   res.json({ message: 'DELETE /users/:uid' });
// };

export {
  //  getUsers,
  signupAsDoctor,
  signupAsPatient,
  login,
  //  deleteUser
};
