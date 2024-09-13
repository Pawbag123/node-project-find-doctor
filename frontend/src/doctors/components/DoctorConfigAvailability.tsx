import React from 'react';
import { Grid, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

import './DoctorConfigAvailability.css';

interface DoctorConfigAvailabilityProps {
  availability: { from: Dayjs | null; to: Dayjs | null }[];
  setAvailability: (
    availability: { from: Dayjs | null; to: Dayjs | null }[]
  ) => void;
}

const DoctorConfigAvailability: React.FC<DoctorConfigAvailabilityProps> = ({
  availability,
  setAvailability,
}) => {
  const handleTimeChange = (
    dayIndex: number,
    type: 'from' | 'to',
    time: Dayjs | null
  ) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      [type]: time,
    };

    // If 'from' time is changed and 'to' time is earlier, adjust 'to' time
    if (type === 'from' && time && updatedAvailability[dayIndex].to) {
      if (time.isAfter(updatedAvailability[dayIndex].to!)) {
        updatedAvailability[dayIndex].to = time;
      }
    }

    setAvailability(updatedAvailability);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Availability
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {[
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ].map((day, index) => (
          <Grid container spacing={2} key={day} alignItems="center">
            <Grid item xs={2}>
              <Typography variant="body1">{day}</Typography>
            </Grid>
            <Grid item xs={5}>
              <TimePicker
                label="From"
                value={availability[index].from}
                minutesStep={30}
                onChange={(time) => handleTimeChange(index, 'from', time)}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                // renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={5}>
              <TimePicker
                label="To"
                value={availability[index].to}
                minutesStep={30}
                onChange={(time) => handleTimeChange(index, 'to', time)}
                minTime={availability[index].from || undefined}
                disabled={!availability[index].from}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                // renderInput={(params) => (
                //   <TextField
                //     {...params}
                //     fullWidth
                //     helperText={
                //       availability[index].from &&
                //       availability[index].to &&
                //       availability[index].to.isBefore(availability[index].from)
                //         ? '"To" time cannot be earlier than "From" time.'
                //         : ''
                //     }
                //   />
                // )}
              />
            </Grid>
          </Grid>
        ))}
      </LocalizationProvider>
    </>
  );
};

export default DoctorConfigAvailability;
