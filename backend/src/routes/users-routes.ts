import express from 'express';
import rateLimit from 'express-rate-limit';

import {
  // getUsers,
  signupAsDoctor,
  signupAsPatient,
  login,
  // deleteUser,
} from '../controllers/users-controllers';
import { validateUserInput } from '../validators/users-validators';
import { validatePatientInput } from '../validators/patients-validators';
import { validateDoctorInput } from '../validators/doctors-validators';
// import {
//   checkAuthUser,
//   checkAuthUserParam,
// } from '../middleware/auth-middleware';

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many requests, please try again in 10 minutes',
});

const router = express.Router();

//unused
// router.get('/', getUsers);

//used
router.post(
  '/signup/patient',
  limiter,
  validateUserInput,
  validatePatientInput,
  signupAsPatient
);

//used
router.post(
  '/signup/doctor',
  limiter,
  validateUserInput,
  validateDoctorInput,
  signupAsDoctor
);

//unused
// router.delete('/:uid', checkAuthUser, checkAuthUserParam, deleteUser);

//used
router.post('/login', limiter, login);

export default router;
