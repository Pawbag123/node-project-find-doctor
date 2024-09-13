import { DateTime } from 'luxon';

import Appointment from '../models/appointment';

// Function to check for finished appointments
export const checkFinishedAppointments = async () => {
  const now = DateTime.now().toJSDate();

  try {
    const finishedAppointments = await Appointment.aggregate([
      {
        $match: {
          $expr: {
            $lt: [
              { $add: ['$startDate', { $multiply: ['$duration', 60000] }] },
              now,
            ],
          },
          status: { $in: ['rescheduled', 'approved'] },
        },
      },
    ]);

    const appointmentIds = finishedAppointments.map(
      (appointment) => appointment._id
    );

    if (appointmentIds.length > 0) {
      await Appointment.updateMany(
        { _id: { $in: appointmentIds } }, // Filter by expired appointment IDs
        { $set: { status: 'finished' } } // Set the status to "finished"
      );

      console.log(
        `Updated ${appointmentIds.length} appointments to "finished".`
      );
    } else {
      console.log('No finished appointments found.');
    }
  } catch (err) {
    console.error('Error checking finished appointments:', err);
  }
};
