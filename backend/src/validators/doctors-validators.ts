import { body } from 'express-validator';
import mongoose, { Types } from 'mongoose';
import { DateTime } from 'luxon';

import { getBookedSlots } from '../utils/getBookedSlots';
import Appointment from '../models/appointment';
import { HttpError } from '../models/http-error';
import Specialty from '../models/specialty';
import Cause from '../models/cause';
import {
  validateResults,
  validateIdChain,
} from '../middleware/validation-middleware';

const validDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const validTimeSlotRegex = /^([01]\d|2[0-3]):(00|30)$/;

const validateCause = async (causeId: string, specialtyId: string) => {
  if (!mongoose.Types.ObjectId.isValid(causeId)) {
    throw new HttpError(`Invalid causeId ${causeId}`, 422);
  }

  try {
    const cause = await Cause.findById(causeId);
    if (!cause) {
      throw new HttpError(`Cause with ID ${causeId} not found`, 404);
    }

    if (!cause.specialtyId.equals(specialtyId)) {
      throw new HttpError(
        `Cause with ID ${causeId} does not belong to the specified specialty`,
        422
      );
    }
  } catch (err) {
    if (err.code) {
      throw err;
    } else {
      throw new HttpError('Fetching cause failed, please try again', 500);
    }
  }
};

const validateAvailability = (availability: { [day: string]: string[] }) => {
  if (!Object.values(availability).some((slots) => slots.length > 0)) {
    throw new HttpError(
      'At least one day of availability must have non-empty time slots',
      422
    );
  }
  for (const day in availability) {
    if (!validDays.includes(day)) {
      throw new HttpError(`Invalid day of the week: ${day}`, 422);
    }
    if (!Array.isArray(availability[day])) {
      throw new HttpError(`Availability for ${day} must be an array`, 422);
    }
    for (const timeSlot of availability[day]) {
      if (!validTimeSlotRegex.test(timeSlot)) {
        throw new HttpError(`Invalid time slot: ${timeSlot}`, 422);
      }
    }
  }
  return true;
};

export const validateDoctorInput = validateResults([
  body('image').notEmpty().withMessage('Image is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('specialtyId')
    .notEmpty()
    .withMessage('Specialty ID is required')
    .custom(validateIdChain('specialtyId', Specialty)),
  body('causes')
    .isArray({ min: 1 })
    .withMessage('Causes must contain at least one element')
    .custom(async (causes, { req }) => {
      const specialtyId = req.body.specialtyId;
      for (const causeId of causes) {
        await validateCause(causeId, specialtyId);
      }
    }),
  body('availability')
    .isObject()
    .withMessage('Availability must be an object')
    .custom(validateAvailability),
]);

export const validateDoctorCausesForAppointments = async (
  doctorId: Types.ObjectId,
  removedCauses: Types.ObjectId[]
) => {
  if (removedCauses.length === 0) {
    return;
  }

  let conflictingAppointments;
  try {
    conflictingAppointments = await Appointment.find({
      doctorId: doctorId,
      causeId: { $in: removedCauses },
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' },
    });
  } catch (err) {
    console.error(err);
    throw new HttpError('Could not validate appointments', 500);
  }

  if (conflictingAppointments.length > 0) {
    throw new HttpError(
      'Cannot remove causes linked to future appointments. Please reschedule or cancel the appointments first.',
      400
    );
  }
};

export const validateAppointmentsTimeSlots = async (
  doctorId: string,
  newAvailability: { [day: string]: string[] }
) => {
  const appointments = await Appointment.find({
    doctorId: doctorId,
    status: { $in: ['approved', 'rescheduled'] },
    startDate: { $gte: new Date() },
  });

  if (appointments.length === 0) return;

  // const bookedSlots: string[] = [];
  const bookedSlots: { date: string; slots: string[] }[] = [];

  for (const appointment of appointments) {
    const startDate = new Date(appointment.startDate);
    const duration = appointment.duration;

    const bookedIntervals = getBookedSlots(startDate, duration);
    bookedSlots.push({
      date: startDate.toISOString(),
      slots: Object.keys(bookedIntervals),
    });
  }

  // Validate if all booked slots are covered by new availability
  const availableSlots = (dayOfWeek: string) =>
    newAvailability[dayOfWeek] || [];

  const isAvailable = bookedSlots.every((slot) => {
    const dayOfWeek = DateTime.fromISO(slot.date).toFormat('EEEE');

    return slot.slots.every((slot) => availableSlots(dayOfWeek).includes(slot));
  });

  if (!isAvailable) {
    throw new HttpError(
      'The new availability does not cover all booked slots',
      422
    );
  }
};
