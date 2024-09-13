import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { IBookedSlots } from '../../types';

interface IAppointment {
  startDate: string;
  duration: number;
}

export const mapAppointmentsToTime = (appointments: IAppointment[]) => {
  const bookedSlots: IBookedSlots = {};

  appointments.forEach(({ startDate, duration }) => {
    const startTime = dayjs(startDate).utc();
    const dateKey = startTime.format('YYYY-MM-DD');
    const slots = [];

    // Calculate all slots in 30-minute intervals based on the duration
    const slotCount = duration / 30;
    for (let i = 0; i < slotCount; i++) {
      slots.push(startTime.add(i * 30, 'minute').format('HH:mm'));
    }

    // If the date already exists, append the slots
    if (bookedSlots[dateKey]) {
      bookedSlots[dateKey] = [...bookedSlots[dateKey], ...slots];
    } else {
      bookedSlots[dateKey] = slots;
    }
  });

  return bookedSlots;
};
