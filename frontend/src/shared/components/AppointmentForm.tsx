import React, { useState, useContext } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  // TextField,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { shouldDisableTime } from '../utils/shouldDisableTime';
import { IDoctorForAppointment, defaultAppointmentData } from '../../types';
import { useHttpClient } from '../hooks/http-hook';
import { useSnackbar } from 'notistack';
import { AuthContext } from '../context/auth-context';
import LoadingSpinner from './UIElements/LoadingSpinner';

interface AppointmentFormProps {
  isDoctor?: boolean;
  doctor: IDoctorForAppointment;
  defaultData?: defaultAppointmentData;
  handleEdit?: (
    causeId: string,
    startDate: string,
    duration: number
  ) => Promise<void>;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isDoctor,
  doctor,
  defaultData,
  handleEdit,
}) => {
  const navigate = useNavigate();
  const { sendRequest, isLoading } = useHttpClient();
  const { enqueueSnackbar } = useSnackbar();
  const { token, profileId } = useContext(AuthContext);
  const [cause, setCause] = useState(defaultData?.cause || '');
  const [date, setDate] = useState<Dayjs | null>(
    defaultData?.date ? dayjs(defaultData.date, 'DD.MM.YYYY') : null
  );
  const [hour, setHour] = useState(
    defaultData?.duration ? Math.floor(Number(defaultData.duration) / 60) : 0
  );
  const [minute, setMinute] = useState(
    defaultData?.duration ? Number(defaultData.duration) % 60 : 0
  );
  const [time, setTime] = useState<Dayjs | null>(
    defaultData?.time ? dayjs(defaultData.time, 'HH:mm') : null
  );

  const shouldDisableDate = (day: Dayjs) => {
    const weekday = day.format('dddd') as keyof typeof doctor.availability;
    return !doctor.availability[weekday]?.length;
  };

  const handleSubmit = async () => {
    try {
      await sendRequest(
        `http://${window.location.hostname}:5000/api/appointments`,
        'POST',
        JSON.stringify({
          doctorId: doctor.id,
          patientId: profileId,
          causeId: cause,
          startDate: `${date?.format('YYYY-MM-DD')}T${time?.format(
            'HH:mm:00.000'
          )}Z`,
          duration: hour * 60 + minute,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      );
      enqueueSnackbar('Appointment created successfully', {
        variant: 'success',
      });
      navigate('/patient');
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner asOverlay />}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="cause-label">Cause</InputLabel>
            <Select
              labelId="cause-label"
              value={cause}
              disabled={isDoctor}
              onChange={(e) => setCause(e.target.value)}
            >
              {doctor.causes.map((c, index) => (
                <MenuItem key={index} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
                setTime(null);
              }}
              shouldDisableDate={shouldDisableDate}
              // renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="hour-label">Hours</InputLabel>
            <Select
              labelId="hour-label"
              value={hour}
              onChange={(e) => {
                setHour(Number(e.target.value));
                setTime(null);
              }}
            >
              {[0, 1, 2, 3, 4].map((h) => (
                <MenuItem key={h} value={h}>
                  {h}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="minute-label">Minutes</InputLabel>
            <Select
              labelId="minute-label"
              value={minute}
              onChange={(e) => {
                setMinute(Number(e.target.value));
                setTime(null);
              }}
            >
              {[0, 30].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
              <TimePicker
                label="Select Time"
                value={time}
                minutesStep={30}
                disabled={!date || (!hour && !minute)}
                shouldDisableTime={(timeValue) => {
                  return shouldDisableTime(
                    date ? date.format('YYYY-MM-DD') : '',
                    hour * 60 + minute,
                    doctor.availability,
                    doctor.bookedSlots
                  )(timeValue);
                }}
                onChange={(newTime) => setTime(newTime)}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                // renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>

        <Grid item xs={6}>
          {!handleEdit && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.history.back()}
            >
              Go back to browser
            </Button>
          )}
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="secondary"
            disabled={!cause || !date || (!hour && !minute) || !time}
            onClick={
              handleEdit
                ? () => {
                    handleEdit(
                      cause,
                      `${date?.format('YYYY-MM-DD')}T${time?.format(
                        'HH:mm:00.000'
                      )}Z`,
                      hour * 60 + minute
                    );
                  }
                : handleSubmit
            }
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default AppointmentForm;
