import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Doctor from '../models/doctor';
import Specialty from '../models/specialty';
import Cause from '../models/cause';
import Appointment from '../models/appointment';
import User from '../models/user';
import Patient from '../models/patient';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const INIT_MARKER = 'init_marker';

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

const populateDb = async () => {
  try {
    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const marker = await db.collection(INIT_MARKER).findOne({ type: 'data' });

    if (marker) {
      console.log('Data already populated, skipping initialization');
    } else {
      const cardiologySpecialty = await Specialty.create({
        name: 'Cardiology',
      });
      const neurologySpecialty = await Specialty.create({ name: 'Neurology' });

      await cardiologySpecialty.save();
      console.log('Cardiology specialty created');
      await neurologySpecialty.save();
      console.log('Neurology specialty created');

      const heartDisease = await Cause.create({
        name: 'Heart Disease',
        specialtyId: cardiologySpecialty._id,
      });

      const stroke = await Cause.create({
        name: 'Stroke',
        specialtyId: neurologySpecialty._id,
      });
      const hypertension = await Cause.create({
        name: 'Hypertension',
        specialtyId: cardiologySpecialty._id,
      });
      const arrhythmias = await Cause.create({
        name: 'Arrhythmias',
        specialtyId: cardiologySpecialty._id,
      });
      const epilepsy = await Cause.create({
        name: 'Epilepsy',
        specialtyId: neurologySpecialty._id,
      });

      await heartDisease.save();
      console.log('Heart Disease cause created');
      await stroke.save();
      console.log('Stroke cause created');
      await hypertension.save();
      console.log('Hypertension cause created');
      await arrhythmias.save();
      console.log('Arrhythmias cause created');
      await epilepsy.save();
      console.log('Epilepsy cause created');

      const patientCarlJones = await Patient.create({
        name: 'Carl Jones',
        age: 25,
        appointments: [],
      });
      const patientJenniferStacy = await Patient.create({
        name: 'Jennifer Stacy',
        age: 47,
        appointments: [],
      });

      await patientCarlJones.save();
      console.log('Carl Jones patient created');
      await patientJenniferStacy.save();
      console.log('Jennifer Stacy patient created');

      const drJohnDoe = await Doctor.create({
        name: 'Dr John Doe',
        image:
          'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
        address: 'warsaw',
        location: {
          type: 'Point',
          coordinates: [52.2296756, 21.0122287],
        },
        specialtyId: cardiologySpecialty._id,
        causes: [heartDisease._id, hypertension._id],
        availability: {
          Monday: [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
          ],
          Wednesday: [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
          ],
          Friday: [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
          ],
          Saturday: [],
          Sunday: [],
          Thursday: [],
          Tuesday: [],
        },
        appointments: [],
      });

      const drJaneThomas = await Doctor.create({
        name: 'Dr Jane Thomas',
        image:
          'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
        location: {
          type: 'Point',
          coordinates: [53.4285438, 14.5528116],
        },
        address: 'szczecin',
        specialtyId: cardiologySpecialty._id,
        causes: [arrhythmias._id],
        availability: {
          Monday: [],
          Wednesday: [],
          Friday: [],
          Saturday: [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
          ],
          Sunday: [],
          Thursday: [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
          ],
          Tuesday: [
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
          ],
        },
        appointments: [],
      });

      await drJohnDoe.save();
      console.log('Dr John Doe doctor created');

      await drJaneThomas.save();
      console.log('Dr Jane Thomas doctor created');

      const drMarkJohnson = await Doctor.create({
        name: 'Dr Mark Johnson',
        image:
          'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
        address: 'wroclaw',
        location: {
          type: 'Point',
          coordinates: [51.10929480000001, 17.0386019],
        },
        specialtyId: neurologySpecialty._id,
        causes: [epilepsy._id, stroke._id],
        availability: {
          Monday: [
            '00:30',
            '01:00',
            '01:30',
            '02:00',
            '02:30',
            '03:00',
            '03:30',
            '04:00',
            '04:30',
            '05:00',
            '05:30',
            '06:00',
            '06:30',
            '07:00',
            '07:30',
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
            '18:00',
            '18:30',
            '19:00',
            '19:30',
            '20:00',
            '20:30',
            '21:00',
          ],
          Tuesday: [
            '00:30',
            '01:00',
            '01:30',
            '02:00',
            '02:30',
            '03:00',
            '03:30',
            '04:00',
            '04:30',
            '05:00',
            '05:30',
            '06:00',
            '06:30',
            '07:00',
            '07:30',
            '08:00',
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
            '18:00',
            '18:30',
            '19:00',
            '19:30',
            '20:00',
            '20:30',
            '21:00',
          ],
          Friday: [
            '00:30',
            '01:00',
            '01:30',
            '02:00',
            '02:30',
            '03:00',
            '03:30',
            '04:00',
            '04:30',
            '05:00',
            '05:30',
            '06:00',
            '06:30',
            '07:00',
            '07:30',
            '08:00',
            '08:30',
            '09:00',
          ],
          Wednesday: [],
          Thursday: [],
          Saturday: [],
          Sunday: [],
        },
        appointments: [],
      });

      await drMarkJohnson.save();
      console.log('Dr Mark Johnson doctor created');

      const userJohnDoe = await User.create({
        email: 'johndoe@email.com',
        password:
          '$2a$12$LsjdmPM.iuVIBHqi.Lkfbe.Cw4sawWmgqGtcgdEjBB1Z45HUJLvTq',
        role: 'doctor',
        doctorProfileId: drJohnDoe._id,
      });
      await userJohnDoe.save();
      console.log('User John Doe created');

      const userJaneThomas = await User.create({
        email: 'janethomas@email.com',
        password:
          '$2a$12$kdvXIBhj9o.EGnjdnxSWM.ioZ66HHj041I.P.0PD5Db1LSHEZ0l92',
        role: 'doctor',
        doctorProfileId: drJaneThomas._id,
      });
      await userJaneThomas.save();
      console.log('User Jane Thomas created');

      const userMarkJohnson = await User.create({
        email: 'markjohnson@email.com',
        password:
          '$2a$12$oy0tCydqOc.GIfeBrmr/COWue4HkUUhjaeTnTgvDz1HqYjXkWFQJy',
        role: 'doctor',
        doctorProfileId: drMarkJohnson._id,
      });
      await userMarkJohnson.save();
      console.log('User Mark Johnson created');

      const userCarlJones = await User.create({
        email: 'carljones@email.com',
        password:
          '$2a$12$saiO.m2lS/sgJm3ZwuI2deuXwc9ot0nk71PVrMJRLQGSc99pdtYo2',
        role: 'patient',
        patientProfileId: patientCarlJones._id,
      });
      await userCarlJones.save();
      console.log('User Carl Jones created');

      const userJenniferStacy = await User.create({
        email: 'jenniferstacy@email.com',
        password:
          '$2a$12$3y.04SveBt/ZmmY1tMozm.l3KEqr.w5fA2FwNBBZ2/nWdJUK9jkF6',
        role: 'patient',
        patientProfileId: patientJenniferStacy._id,
      });
      await userJenniferStacy.save();
      console.log('User Jennifer Stacy created');

      const appointment1 = await Appointment.create({
        doctorId: drJohnDoe._id,
        patientId: patientCarlJones._id,
        startDate: '2024-09-13T09:30:00.000+00:00',
        duration: 120,
        status: 'cancelled',
        causeId: hypertension._id,
      });

      const appointment2 = await Appointment.create({
        doctorId: drJohnDoe._id,
        patientId: patientCarlJones._id,
        startDate: '2024-09-11T15:00:00.000+00:00',
        duration: 120,
        status: 'finished',
        causeId: hypertension._id,
      });

      const appointment3 = await Appointment.create({
        doctorId: drMarkJohnson._id,
        patientId: patientJenniferStacy._id,
        startDate: '2024-09-23T10:00:00.000+00:00',
        duration: 150,
        status: 'approved',
        causeId: epilepsy._id,
      });

      const appointment4 = await Appointment.create({
        doctorId: drJohnDoe._id,
        patientId: patientJenniferStacy._id,
        startDate: '2024-09-25T09:00:00.000+00:00',
        duration: 150,
        status: 'rescheduled',
        causeId: heartDisease._id,
      });

      await appointment1.save();
      console.log('Appointment 1 created');
      await appointment2.save();
      console.log('Appointment 2 created');
      await appointment3.save();
      console.log('Appointment 3 created');
      await appointment4.save();
      console.log('Appointment 4 created');

      drJohnDoe.appointments.push(appointment1._id);
      drJohnDoe.appointments.push(appointment2._id);
      drJohnDoe.appointments.push(appointment4._id);
      drMarkJohnson.appointments.push(appointment3._id);
      patientCarlJones.appointments.push(appointment1._id);
      patientCarlJones.appointments.push(appointment2._id);
      patientJenniferStacy.appointments.push(appointment3._id);
      patientJenniferStacy.appointments.push(appointment4._id);

      await drJohnDoe.save();
      await drMarkJohnson.save();
      await patientCarlJones.save();
      await patientJenniferStacy.save();
      console.log('Appointments added to doctors and patients');

      await db.collection(INIT_MARKER).insertOne({ type: 'data' });

      console.log('Database initialization marker set');
    }
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Connection to MongoDB closed');
  }
};

populateDb();
