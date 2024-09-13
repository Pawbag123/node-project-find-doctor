import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import userRoutes from './routes/users-routes';
import doctorRoutes from './routes/doctors-routes';
import appointmentsRoutes from './routes/appointments-routes';
import specialtiesRoutes from './routes/specialties-routes';
// import patientRoutes from './routes/patients-routes';
import causesRoutes from './routes/causes-routes';
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from './middleware/error-handler-middleware';
import { corsHeadersMiddleware } from './middleware/cors-headers-middleware';
// import { checkFinishedAppointments } from './utils/appointment-checker';
// import { cleanSpecialtiesAndCauses } from './utils/clean-specialties-and-causes';

// let finishedAppointmentsInterval: NodeJS.Timeout;
// let cleanSpecialtiesAndCausesInterval: NodeJS.Timeout;

// dotenv.config();
// const mongoUri = process.env.MONGODB_URI;

const app = express();

app.use(bodyParser.json());

app.use(corsHeadersMiddleware);

app.get('/api/test-connection', async (req, res) => {
  try {
    const result = await mongoose.connection.db.admin().ping();
    res
      .status(200)
      .json({ success: true, message: 'MongoDB connection is active', result });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to MongoDB',
      error: err,
    });
  }
});

app.use('/api/users', userRoutes);
// app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/causes', causesRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// mongoose
//   .connect(mongoUri)
//   .then(() => {
//     app.listen(5000, () => {
//       console.log('Server is running on port 5000');
//     });

//     checkFinishedAppointments();
//     cleanSpecialtiesAndCauses();

//     finishedAppointmentsInterval = setInterval(
//       checkFinishedAppointments,
//       30 * 60 * 1000
//     );
//     cleanSpecialtiesAndCausesInterval = setInterval(
//       cleanSpecialtiesAndCauses,
//       24 * 60 * 60 * 1000
//     );

//     process.on('SIGINT', () => {
//       clearInterval(finishedAppointmentsInterval);
//       clearInterval(cleanSpecialtiesAndCausesInterval);
//       mongoose.connection.close();
//       console.log('Server is shutting down');
//       process.exit();
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

export default app;
