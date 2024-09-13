import express from 'express';

import {
  getDoctorById,
  getDoctorByIdForAppointment,
  getFilteredDoctors,
  updateDoctor,
  getFilteredDoctorsByDistance,
  // createDoctor,
} from '../controllers/doctors-controllers';
import Doctor from '../models/doctor';
import Specialty from '../models/specialty';
import Cause from '../models/cause';
import { validateDoctorInput } from '../validators/doctors-validators';
import { validateIdParam } from '../middleware/validation-middleware';
import {
  checkAuthDoctor,
  checkAuthDoctorParam,
  checkAuthPatient,
} from '../middleware/auth-middleware';

const router = express.Router();

//used
router.get(
  '/appointment/:did',
  checkAuthPatient,
  validateIdParam('did', Doctor),
  getDoctorByIdForAppointment
);

//used
router.get(
  '/:sid/:cid/:place/:dist',
  validateIdParam('sid', Specialty),
  validateIdParam('cid', Cause),
  getFilteredDoctorsByDistance
);

//used
router.get(
  '/:sid/:cid',
  validateIdParam('sid', Specialty),
  validateIdParam('cid', Cause),
  getFilteredDoctors
);

//used
router.get(
  '/:did',
  checkAuthDoctor,
  validateIdParam('did', Doctor),
  checkAuthDoctorParam,
  getDoctorById
);

//unused
// router.post('/', validateDoctorInput, createDoctor);

//used
router.patch(
  '/:did',
  checkAuthDoctor,
  validateIdParam('did', Doctor),
  checkAuthDoctorParam,
  validateDoctorInput,
  updateDoctor
);

export default router;
