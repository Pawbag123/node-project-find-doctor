import { AppointmentStatus } from '../../types';

export const getStatusColors = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Approved:
      return { background: '#d4edda', color: '#000000' }; // Green background, black font
    case AppointmentStatus.Rescheduled:
      return { background: '#fff3cd', color: '#000000' }; // Yellow background, black font
    case AppointmentStatus.Cancelled:
      return { background: '#f8d7da', color: '#000000' }; // Red background, black font
    case AppointmentStatus.Finished:
      return { background: '#d1ecf1', color: '#000000' }; // Blue background, black font
    default:
      return { background: '#f8f9fa', color: '#000000' }; // Default Grey background, black font
  }
};
