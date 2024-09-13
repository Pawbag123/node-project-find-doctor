import { RequestHandler } from 'express';

import { HttpError } from '../models/http-error';
import Patient from '../models/patient';

const createPatient: RequestHandler = async (req, res, next) => {
  const { name, age } = req.body;

  const createdPatient = new Patient({
    name,
    age,
    appointments: [],
  });

  try {
    await createdPatient.save();
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Creating patient failed, please try again', 500)
    );
  }

  res.status(201).json({ patient: createdPatient.toObject({ getters: true }) });
};

const getAllPatients: RequestHandler = async (req, res, next) => {
  let patients;

  try {
    patients = await Patient.find();
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Fetching patients failed, please try again.', 500)
    );
  }

  res.json({
    patients: patients.map((patient) => patient.toObject({ getters: true })),
  });
};

const getPatientById: RequestHandler = async (req, res, next) => {
  const patientId = req.params.pid;

  let patient;
  try {
    patient = await Patient.findById(patientId);
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Fetching patient failed, please try again.', 500)
    );
  }

  res.json({ patient: patient.toObject({ getters: true }) });
};

const updatePatient: RequestHandler = async (req, res, next) => {
  const patientId = req.params.pid;
  const { name, age } = req.body;

  let patient;
  try {
    patient = await Patient.findById(patientId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update patient', 500));
  }

  patient.name = name;
  patient.age = age;

  try {
    await patient.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update patient', 500));
  }

  res.status(200).json({ patient: patient.toObject({ getters: true }) });
};

export { createPatient, getAllPatients, getPatientById, updatePatient };
