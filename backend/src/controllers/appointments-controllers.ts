import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { HttpError } from '../models/http-error';
import { AppointmentStatus } from '../types';
import Appointment from '../models/appointment';
import Doctor from '../models/doctor';
import Patient from '../models/patient';

const getAppointmentsForPatient: RequestHandler = async (req, res, next) => {
  const patientId = req.params.pid;

  let appointments;
  try {
    appointments = await Appointment.find({ patientId })
      .sort({ startDate: 1 })
      .populate([
        {
          path: 'doctorId',
          select: 'name address',
        },
        {
          path: 'causeId',
          select: 'name',
        },
      ]);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Fetching appointments failed', 500));
  }

  res.json({
    appointments: appointments.map((appointment) =>
      appointment.toObject({ getters: true })
    ),
  });
};

const getAppointmentsForDoctor: RequestHandler = async (req, res, next) => {
  const doctorId = req.params.did;

  let appointments;

  try {
    appointments = await Appointment.find({ doctorId })
      .sort({ startDate: 1 })
      .populate([
        {
          path: 'patientId',
          select: 'name age',
        },
        {
          path: 'causeId',
          select: 'name',
        },
      ]);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Fetching appointments failed', 500));
  }

  res.json({
    appointments: appointments.map((appointment) =>
      appointment.toObject({ getters: true })
    ),
  });
};

const getAppointmentToEdit: RequestHandler = async (req, res, next) => {
  const appointmentId = req.params.aid;
  const userData = res.locals.userData;

  let appointment;
  try {
    appointment = await Appointment.findById(appointmentId).populate([
      {
        path: 'doctorId',
        select: 'name image address availability',
        populate: [
          {
            path: 'appointments',
            select: 'startDate duration',
            match: {
              status: { $in: ['approved', 'rescheduled'] },
              _id: { $ne: appointmentId },
            },
          },
          {
            path: 'specialtyId',
            select: 'name',
          },
          {
            path: 'causes',
            select: 'name',
          },
        ],
      },
    ]);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not find appointment', 500));
  }

  if (!appointment) {
    return next(new HttpError('Appointment not found', 404));
  }

  if (
    userData.profileId !== appointment.patientId.toString() &&
    userData.profileId !== appointment.doctorId._id.toString()
  ) {
    return next(new HttpError('Not authorized to edit appointment', 401));
  }

  res.json({
    appointment: appointment.toObject({ getters: true }),
  });
};

const createAppointment: RequestHandler = async (req, res, next) => {
  const { patientId, doctorId, causeId, startDate, duration } = req.body;
  const userData = res.locals.userData;

  const createdAppointment = new Appointment({
    patientId,
    doctorId,
    causeId,
    status: AppointmentStatus.Approved,
    startDate,
    duration,
  });

  let patient;
  let doctor;

  try {
    patient = await Patient.findById(patientId);
    doctor = await Doctor.findById(doctorId);

    if (!patient || !doctor) {
      return next(
        new HttpError('Could not find patient or doctor for provided IDs', 404)
      );
    }
  } catch (err) {
    console.error(err);
    return next(new HttpError('Fetching patient or doctor failed', 500));
  }

  if (userData.profileId !== patientId) {
    return next(new HttpError('Not authorized to create appointment', 401));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await createdAppointment.save({ session });

    patient.appointments.push(createdAppointment._id);
    doctor.appointments.push(createdAppointment._id);

    await patient.save({ session });
    await doctor.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    return next(new HttpError('Creating appointment failed', 500));
  } finally {
    session.endSession();
  }

  res
    .status(201)
    .json({ appointment: createdAppointment.toObject({ getters: true }) });
};

const updateAppointment: RequestHandler = async (req, res, next) => {
  const appointmentId = req.params.aid;
  const { startDate, duration, causeId } = req.body;
  const userData = res.locals.userData;

  let appointment;

  try {
    appointment = await Appointment.findById(appointmentId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update appointment', 500));
  }

  if (
    appointment.status === AppointmentStatus.Finished ||
    appointment.status === AppointmentStatus.Cancelled
  ) {
    return next(
      new HttpError('Cannot update finished or cancelled appointment', 400)
    );
  }

  if (userData.profileId !== appointment.patientId.toString()) {
    return next(new HttpError('Not authorized to update appointment', 401));
  }

  appointment.startDate = startDate;
  appointment.duration = duration;
  appointment.causeId = causeId;

  try {
    await appointment.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update appointment', 500));
  }

  res
    .status(200)
    .json({ appointment: appointment.toObject({ getters: true }) });
};

const updateAppointmentStatus: RequestHandler = async (req, res, next) => {
  const appointmentId = req.params.aid;
  const { status } = req.body;
  const userData = res.locals.userData;

  let appointment;

  try {
    appointment = await Appointment.findById(appointmentId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update appointment', 500));
  }

  if (
    userData.profileId !== appointment.patientId.toString() &&
    userData.profileId !== appointment.doctorId.toString()
  ) {
    return next(new HttpError('Not authorized to update appointment', 401));
  }

  if (
    appointment.status === AppointmentStatus.Finished ||
    appointment.status === AppointmentStatus.Cancelled
  ) {
    return next(
      new HttpError(
        'Cannot update status of finished or cancelled appointment',
        400
      )
    );
  }

  if (
    status === AppointmentStatus.Approved &&
    userData.profileId === appointment.doctorId.toString()
  ) {
    return next(new HttpError('Cannot approve appointment as a doctor', 400));
  }

  appointment.status = status;

  try {
    await appointment.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update appointment', 500));
  }

  res
    .status(200)
    .json({ appointment: appointment.toObject({ getters: true }) });
};

const rescheduleAppointment: RequestHandler = async (req, res, next) => {
  const appointmentId = req.params.aid;
  const { startDate, duration } = req.body;
  const userData = res.locals.userData;

  let appointment;

  try {
    appointment = await Appointment.findById(appointmentId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not reschedule appointment', 500));
  }

  if (userData.profileId !== appointment.doctorId.toString()) {
    return next(new HttpError('Not authorized to reschedule appointment', 401));
  }

  if (appointment.status !== AppointmentStatus.Approved) {
    return next(
      new HttpError('Cannot reschedule appointment that is not approved', 400)
    );
  }

  appointment.startDate = startDate;
  appointment.duration = duration;
  appointment.status = AppointmentStatus.Rescheduled;

  try {
    await appointment.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not reschedule appointment', 500));
  }

  res
    .status(200)
    .json({ appointment: appointment.toObject({ getters: true }) });
};

const deleteAppointment: RequestHandler = async (req, res, next) => {
  const appointmentId = req.params.aid;
  const userData = res.locals.userData;

  let appointment;

  try {
    appointment = await Appointment.findById(appointmentId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not find appointment', 500));
  }

  if (!appointment) {
    return next(new HttpError('Appointment not found', 404));
  }

  const doctorId = appointment.doctorId;
  const patientId = appointment.patientId;

  if (
    userData.profileId !== doctorId.toString() &&
    userData.profileId !== patientId.toString()
  ) {
    return next(new HttpError('Not authorized to delete appointment', 401));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Doctor.updateOne(
      { _id: doctorId },
      { $pull: { appointments: appointmentId } },
      { session }
    );

    await Patient.updateOne(
      { _id: patientId },
      { $pull: { appointments: appointmentId } },
      { session }
    );

    await Appointment.deleteOne({ _id: appointmentId }, { session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError('Deleting appointment failed, please try again.', 500)
    );
  }

  res.status(200).json({ message: 'Deleted appointment.' });
};

export {
  getAppointmentsForPatient,
  getAppointmentsForDoctor,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAppointmentToEdit,
};
