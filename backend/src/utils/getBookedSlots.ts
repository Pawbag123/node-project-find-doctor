import { DateTime } from 'luxon';

interface BookedTime {
  [key: string]: boolean;
}

export const getBookedSlots = (
  startDate: Date,
  duration: number
): BookedTime => {
  const intervals: BookedTime = {};
  const start = DateTime.fromJSDate(startDate).toUTC();
  const end = start.plus({ minutes: duration });

  let current = start;

  while (current < end) {
    const timeSlot = current.toFormat('HH:mm');
    intervals[timeSlot] = true;
    current = current.plus({ minutes: 30 });
  }

  return intervals;
};
