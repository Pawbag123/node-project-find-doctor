import express from 'express';

// import Patient from '../models/patient';
// import { validateIdParam } from '../middleware/validation-middleware';
// import { validatePatientInput } from '../validators/patients-validators';
// import {
//   createPatient,
//   updatePatient,
//   getAllPatients,
//   getPatientById,
// } from '../controllers/patients.controllers';
// import {
//   checkAuthPatient,
//   checkAuthPatientParam,
// } from '../middleware/auth-middleware';

const router = express.Router();

//unused for now

// router.post('/', validatePatientInput, createPatient);

// router.patch(
//   '/:pid',
//   checkAuthPatient,
//   validateIdParam('pid', Patient),
//   checkAuthPatientParam,
//   validatePatientInput,
//   updatePatient
// );

// router.get(
//   '/:pid',
//   checkAuthPatient,
//   validateIdParam('pid', Patient),
//   checkAuthPatientParam,
//   getPatientById
// );

// router.get('/', getAllPatients);

export default router;
