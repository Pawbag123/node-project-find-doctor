import mongoose from 'mongoose';
import dotenv from 'dotenv';

import app from './app';
import { checkFinishedAppointments } from './utils/appointment-checker';
import { cleanSpecialtiesAndCauses } from './utils/clean-specialties-and-causes';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

let finishedAppointmentsInterval: NodeJS.Timeout;
let cleanSpecialtiesAndCausesInterval: NodeJS.Timeout;

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });

    checkFinishedAppointments();
    cleanSpecialtiesAndCauses();

    //check for finished appointments every 30 minutes
    finishedAppointmentsInterval = setInterval(
      checkFinishedAppointments,
      30 * 60 * 1000
    );

    //clean unused specialties and causes every 24 hours
    cleanSpecialtiesAndCausesInterval = setInterval(
      cleanSpecialtiesAndCauses,
      24 * 60 * 60 * 1000
    );

    process.on('SIGINT', () => {
      clearInterval(finishedAppointmentsInterval);
      clearInterval(cleanSpecialtiesAndCausesInterval);
      mongoose.connection.close();
      console.log('Server is shutting down');
      process.exit();
    });
  })
  .catch((err) => {
    console.log(err);
  });
