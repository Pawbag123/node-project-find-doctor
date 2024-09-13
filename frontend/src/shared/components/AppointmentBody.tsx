import React from 'react';
import { Box, Typography } from '@mui/material';

import { AppointmentStatus } from '../../types';

interface AppointmentBodyProps {
  status: AppointmentStatus;
  name: string;
  cause?: string;
  date: string;
  duration: string;
  time: string;
  address?: string;
}

const AppointmentBody: React.FC<AppointmentBodyProps> = ({
  status,
  name,
  cause,
  date,
  duration,
  time,
  address,
}) => {
  return (
    <>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1">{status}</Typography>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2">{cause || 'No cause specified'}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', mr: 2 }}>
        <Typography variant="body2">{date}</Typography>
        <Typography variant="body2">{time}</Typography>
        <Typography variant="body2">{`${
          Math.floor(Number(duration) / 60)
            ? `${Math.floor(Number(duration) / 60)} h `
            : ''
        } ${
          Number(duration) % 60 ? `${Number(duration) % 60} min` : ''
        }`}</Typography>
        {address && <Typography variant="body2">{address}</Typography>}
      </Box>
    </>
  );
};

export { AppointmentBody };
