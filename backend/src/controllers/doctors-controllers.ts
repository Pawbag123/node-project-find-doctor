import { RequestHandler } from 'express';

import Doctor from '../models/doctor';
import { HttpError } from '../models/http-error';
import { getCoordsForAddress, calculateDistance } from '../utils/location';
import {
  validateAppointmentsTimeSlots,
  validateDoctorCausesForAppointments,
} from '../validators/doctors-validators';

const getDoctorByIdForAppointment: RequestHandler = async (req, res, next) => {
  const doctorId = req.params.did;

  let doctor;

  try {
    doctor = await Doctor.findById(doctorId).populate([
      {
        path: 'appointments',
        select: 'startDate duration',
        match: { status: { $in: ['approved', 'rescheduled'] } },
      },
      {
        path: 'specialtyId',
        select: 'name',
      },
      {
        path: 'causes',
        select: 'name',
      },
    ]);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not find doctor', 500));
  }

  res.json({
    doctor: doctor.toObject({ getters: true }),
  });
};

const getDoctorById: RequestHandler = async (req, res, next) => {
  const doctorId = req.params.did;

  let doctor;

  try {
    doctor = await Doctor.findById(doctorId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not find doctor', 500));
  }

  res.json({ doctor: doctor.toObject({ getters: true }) });
};

const getFilteredDoctors: RequestHandler = async (req, res, next) => {
  const specialtyId = req.params.sid;
  const causeId = req.params.cid;

  let doctors;
  try {
    doctors = await Doctor.find({ specialtyId, causes: causeId })
      .populate('specialtyId', 'name')
      .populate('causes', 'name');
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Fetching doctors failed, please try again)', 500)
    );
  }

  res.json({
    doctors: doctors.map((doctor) => doctor.toObject({ getters: true })),
  });
};

//finished
const getFilteredDoctorsByDistance: RequestHandler = async (req, res, next) => {
  const { sid: specialtyId, cid: causeId, place, dist } = req.params;

  const distance = parseInt(dist, 10);
  if (isNaN(distance) || distance < 5 || distance > 1000) {
    return next(
      new HttpError('Distance must be a number between 5 and 1000.', 400)
    );
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(place);
  } catch (err) {
    return next(err);
  }

  let doctors;
  try {
    doctors = await Doctor.find({
      specialtyId: specialtyId,
      causes: causeId,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lat, coordinates.lng],
          },
          $maxDistance: distance * 1000,
        },
      },
    })
      .populate('specialtyId', 'name')
      .populate('causes', 'name');
  } catch (err) {
    return next(
      new HttpError(
        `Fetching doctors failed, please try again later ${err.message}`,
        500
      )
    );
  }

  const doctorsWithDistance = doctors.map((doctor) => {
    const doctorDistance = calculateDistance(
      { lat: coordinates.lat, lng: coordinates.lng },
      {
        lat: doctor.location.coordinates[0],
        lng: doctor.location.coordinates[1],
      }
    );

    return {
      ...doctor.toObject({ getters: true }),
      distance: Math.round(doctorDistance),
    };
  });

  res.json({
    doctors: doctorsWithDistance,
  });
};

// unused
// const createDoctor: RequestHandler = async (req, res, next) => {
//   const { image, name, address, specialtyId, causes, availability } = req.body;

//   let coordinates;
//   try {
//     coordinates = await getCoordsForAddress(address);
//   } catch (err) {
//     return next(err);
//   }

//   const createdDoctor = new Doctor({
//     image,
//     name,
//     address,
//     specialtyId,
//     causes,
//     location: {
//       type: 'Point',
//       coordinates: [coordinates.lat, coordinates.lng],
//     },
//     availability,
//     appointments: [],
//   });

//   try {
//     await createdDoctor.save();
//   } catch (err) {
//     return next(new HttpError('Creating doctor failed, please try again', 500));
//   }

//   res.status(201).json({ doctor: createdDoctor.toObject({ getters: true }) });
// };

const updateDoctor: RequestHandler = async (req, res, next) => {
  const doctorId = req.params.did;
  const { image, name, address, specialtyId, causes, availability } = req.body;

  let doctor;

  try {
    doctor = await Doctor.findById(doctorId);
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update doctor', 500));
  }

  let coordinates;
  if (address !== doctor.address) {
    try {
      coordinates = await getCoordsForAddress(address);
    } catch (err) {
      return next(err);
    }
  } else {
    coordinates = {
      lat: doctor.location.coordinates[0],
      lng: doctor.location.coordinates[1],
    };
  }
  const isSpecialtyChanged = doctor.specialtyId.toString() !== specialtyId;

  if (isSpecialtyChanged && doctor.appointments.length > 0) {
    return next(
      new HttpError('Cannot change specialty with existing appointments', 422)
    );
  }
  // validation if removed causes are listed on appointments
  const removedCauses = doctor.causes.filter(
    (cause) => !causes.includes(cause.toString())
  );

  if (removedCauses.length !== 0) {
    try {
      await validateDoctorCausesForAppointments(doctor._id, removedCauses);
    } catch (err) {
      return next(err);
    }
  }

  try {
    await validateAppointmentsTimeSlots(doctorId, availability);
  } catch (err) {
    return next(err);
  }

  doctor.image = image;
  doctor.name = name;
  doctor.address = address;
  doctor.location = {
    type: 'Point',
    coordinates: [coordinates.lat, coordinates.lng],
  };
  doctor.specialtyId = specialtyId;
  doctor.causes = causes;
  doctor.availability = availability;

  try {
    await doctor.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Could not update doctor', 500));
  }

  res.status(200).json({ doctor: doctor.toObject({ getters: true }) });
};

export {
  getDoctorById,
  getFilteredDoctors,
  updateDoctor,
  getDoctorByIdForAppointment,
  getFilteredDoctorsByDistance,
  // createDoctor,
};
