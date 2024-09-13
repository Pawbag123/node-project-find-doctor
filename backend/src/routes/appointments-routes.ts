import express from 'express';

import {
  createAppointment,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  rescheduleAppointment,
  updateAppointment,
  updateAppointmentStatus,
  getAppointmentToEdit,
} from '../controllers/appointments-controllers';
import {
  validateAppointmentInput,
  validateAppointmentInputWithId,
  validateAppointmentStatusInput,
} from '../validators/appointments-validators';
import { validateIdParam } from '../middleware/validation-middleware';
import Patient from '../models/patient';
import Doctor from '../models/doctor';
import Appointment from '../models/appointment';
import {
  checkAuthDoctor,
  checkAuthPatient,
  checkAuthDoctorParam,
  checkAuthPatientParam,
  checkAuthUser,
} from '../middleware/auth-middleware';

const router = express.Router();

//used
router.get(
  '/patient/:pid',
  checkAuthPatient,
  validateIdParam('pid', Patient),
  checkAuthPatientParam,
  getAppointmentsForPatient
);

//used
router.get(
  '/edit/:aid',
  checkAuthUser,
  validateIdParam('aid', Appointment),
  getAppointmentToEdit
);

//used
router.get(
  '/doctor/:did',
  checkAuthDoctor,
  validateIdParam('did', Doctor),
  checkAuthDoctorParam,
  getAppointmentsForDoctor
);

//used
router.post('/', checkAuthPatient, validateAppointmentInput, createAppointment);

//used
router.patch(
  '/status/:aid',
  checkAuthUser,
  validateIdParam('aid', Appointment),
  validateAppointmentStatusInput,
  updateAppointmentStatus
);

//used
router.patch(
  '/patient/:aid',
  checkAuthPatient,
  validateIdParam('aid', Appointment),
  validateAppointmentInputWithId,
  updateAppointment
);

//used
router.patch(
  '/doctor/:aid',
  checkAuthDoctor,
  validateIdParam('aid', Appointment),
  validateAppointmentInputWithId,
  rescheduleAppointment
);

//unused for now
// router.delete(
//   '/:aid',
//   checkAuthUser,
//   validateIdParam('aid', Appointment),
//   deleteAppointment
// );

export default router;
