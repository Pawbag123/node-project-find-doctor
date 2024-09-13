import dayjs, { Dayjs } from 'dayjs';

import { IBookedSlots } from '../../types';

const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  let current = dayjs(start, 'HH:mm');

  const endTime = dayjs(end, 'HH:mm');

  while (current.isBefore(endTime) || current.isSame(endTime)) {
    slots.push(current.format('HH:mm'));
    current = current.add(30, 'minute');
  }
  return slots;
};

const isTimeSlotBooked = (
  time: string[],
  date: string,
  bookedSlots?: IBookedSlots
): boolean => {
  if (!bookedSlots) return false;
  if (!bookedSlots[date]) return false;

  return time.some((slot) => bookedSlots[date].includes(slot));
  //   return bookedSlots[date].includes(time);
};

export const shouldDisableTime = (
  selectedDate: string,
  duration: number,
  availability: { [key: string]: string[] },
  bookedSlots?: IBookedSlots
): ((time: Dayjs) => boolean) => {
  const dayOfWeek = dayjs(selectedDate).format('dddd');

  const availableHours = availability[dayOfWeek];
  if (!availableHours || availableHours.length === 0) return () => true;

  const startTime = availableHours[0];
  const endTime = availableHours[availableHours.length - 1];

  const availableTimeSlots = generateTimeSlots(startTime, endTime);

  return (time: Dayjs): boolean => {
    const timeString = time.format('HH:mm');
    const timeArray = [timeString];
    for (let i = 1; i < duration / 30; i++) {
      timeArray.push(time.add(i * 30, 'minute').format('HH:mm'));
    }
    if (!availableTimeSlots.includes(timeString)) return true;

    const endSlotTime = time.add(duration, 'minute').format('HH:mm');
    if (!availableTimeSlots.includes(endSlotTime)) return true;

    if (isTimeSlotBooked(timeArray, selectedDate, bookedSlots)) return true;

    return false;
  };
};
