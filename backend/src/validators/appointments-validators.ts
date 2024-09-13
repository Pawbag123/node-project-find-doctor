import { body, CustomValidator } from 'express-validator';
import { DateTime } from 'luxon';
import { Request, Response, NextFunction } from 'express';

import { HttpError } from '../models/http-error';
import {
  validateIdChain,
  validateResults,
} from '../middleware/validation-middleware';
import Doctor from '../models/doctor';
import Patient from '../models/patient';
import Cause from '../models/cause';
import Appointment from '../models/appointment';
import { getBookedSlots } from '../utils/getBookedSlots';

const validateCauseTreatedByDoctor: CustomValidator = async (
  value,
  { req }
) => {
  const doctorId = req.body.doctorId;
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const causeExists = doctor.causes.some((cause) => cause.toString() === value);
  if (!causeExists) {
    throw new HttpError('Doctor does not treat this cause', 422);
  }

  return true;
};

const validateStartDateInterval: CustomValidator = (value) => {
  const dateTime = DateTime.fromISO(value);

  if (![0, 30].includes(dateTime.minute)) {
    throw new HttpError(
      'Appointment start time must be full or half hour',
      422
    );
  }

  return true;
};

const validateDuration: CustomValidator = (value) => {
  if (value % 30 !== 0 || value > 270) {
    throw new HttpError(
      'Duration must be a multiple of 30 minutes and cannot be longer than 4 hours 30 minutes',
      422
    );
  }
  return true;
};

const validateDoctorAvailability = (excludeAppointmentId?: string) => {
  const validator: CustomValidator = async (value, { req }) => {
    const doctorId = req.body.doctorId;
    const startDate = DateTime.fromISO(req.body.startDate).toUTC();

    const duration = req.body.duration;
    const startOfDay = startDate.startOf('day').toJSDate();
    const endOfDay = startDate.endOf('day').toJSDate();
    const appointmentDate = DateTime.fromISO(value);
    const dayOfWeek = appointmentDate.toFormat('EEEE');

    const doctor = await Doctor.findById(doctorId);
    const doctorAppointments = await Appointment.find({
      doctorId,
      startDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['approved', 'rescheduled'] },
      ...(excludeAppointmentId ? { _id: { $ne: excludeAppointmentId } } : {}),
    });

    const availableSlots =
      doctor.availability[dayOfWeek as keyof typeof doctor.availability];

    if (!availableSlots) {
      throw new HttpError('Doctor is not available on this day', 422);
    }

    const slotsToBook = getBookedSlots(appointmentDate.toJSDate(), duration);

    for (const slot in slotsToBook) {
      if (!availableSlots.includes(slot)) {
        throw new HttpError('Doctor is not available at this time', 422);
      }
    }

    for (const appointment of doctorAppointments) {
      const bookedSlots = getBookedSlots(
        appointment.startDate,
        appointment.duration
      );

      for (const slot in slotsToBook) {
        if (bookedSlots[slot]) {
          throw new HttpError('Doctor is not available at this time', 422);
        }
      }
    }

    return true;
  };

  return validator;
};

export const validateAppointmentStatusInput = validateResults([
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'cancelled'])
    .withMessage('Invalid status'),
]);

// add validator for doctor time availability
const validateAppointmentInputChain = (excludeAppointmentId?: string) =>
  validateResults([
    body('doctorId')
      .notEmpty()
      .withMessage('Doctor ID is required')
      .custom(validateIdChain('doctorId', Doctor)),
    body('patientId')
      .notEmpty()
      .withMessage('Patient ID is required')
      .custom(validateIdChain('patientId', Patient)),
    body('causeId')
      .notEmpty()
      .withMessage('Cause ID is required')
      .custom(validateIdChain('causeId', Cause))
      .custom(validateCauseTreatedByDoctor),
    body('startDate')
      .notEmpty()
      .withMessage('Appointment date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .isAfter(new Date().toISOString())
      .withMessage('Appointment date cannot be in the past')
      .custom(validateStartDateInterval)
      .custom(validateDoctorAvailability(excludeAppointmentId)),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isNumeric()
      .withMessage('Duration must be a number')
      .custom(validateDuration)
      .withMessage('Invalid duration'),
  ]);

export const validateAppointmentInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return validateAppointmentInputChain()(req, res, next);
};

export const validateAppointmentInputWithId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const excludeAppointmentId = req.params.aid;
  return validateAppointmentInputChain(excludeAppointmentId)(req, res, next);
};
