import { useState, useEffect, useContext } from 'react';
import { Grid, Typography, Button, TextField } from '@mui/material';
import { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import DoctorConfigSpecialty from '../components/DoctorConfigSpecialty';
import DoctorConfigCauses from '../components/DoctorConfigCauses';
import DoctorConfigAvailability from '../components/DoctorConfigAvailability';
import { IDoctor, IObject } from '../../types';
import { generateAvailability } from '../../shared/utils/generateAvailability';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';

const RegisterDoctor = () => {
  const { login } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { sendRequest: postSpecialtyRequest } = useHttpClient();
  const { sendRequest: getSpecialtiesRequest } = useHttpClient();
  const { sendRequest: getCausesRequest } = useHttpClient();
  const { sendRequest: postCauseRequest } = useHttpClient();
  const { sendRequest: postDoctorRequest, isLoading } = useHttpClient();
  const [allSpecialties, setAllSpecialties] = useState<IObject[]>([]);
  const [allCauses, setAllCauses] = useState<IObject[]>([]);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [availability, setAvailability] = useState(
    Array(7).fill({ from: null as Dayjs | null, to: null as Dayjs | null })
  );

  const loadSpecialties = async () => {
    try {
      const specialtiesData = await getSpecialtiesRequest(
        `http://${window.location.hostname}:5000/api/specialties/`
      );
      setAllSpecialties(specialtiesData.specialties);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(`error when fetching specialties: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const loadCauses = async () => {
    try {
      const causesData = await getCausesRequest(
        `http://${window.location.hostname}:5000/api/causes/${selectedSpecialty}`
      );
      setAllCauses(causesData.causes);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        enqueueSnackbar(`Error fetching causes: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, [getSpecialtiesRequest]);

  useEffect(() => {
    if (!selectedSpecialty) return;
    loadCauses();
  }, [selectedSpecialty, getCausesRequest]);

  const handleSpecialtySubmit = async (specialtyName: string) => {
    try {
      await postSpecialtyRequest(
        `http://${window.location.hostname}:5000/api/specialties/`,
        'POST',
        JSON.stringify({ name: specialtyName }),
        {
          'Content-Type': 'application/json',
        }
      );
      enqueueSnackbar('Specialty added successfully', { variant: 'success' });
      loadSpecialties();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(`Error adding specialty: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const handleSpecialtyChange = async (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setSelectedCauses([]); // Reset the cause to empty when a new specialty is selected
    try {
      const causesData = await getCausesRequest(
        `http://${window.location.hostname}:5000/api/causes/${specialtyId}`
      );
      setAllCauses(causesData.causes);
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(`Error fetching causes: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  const handleCauseSubmit = async (causeName: string) => {
    try {
      await postCauseRequest(
        `http://${window.location.hostname}:5000/api/causes/`,
        'POST',
        JSON.stringify({ name: causeName, specialtyId: selectedSpecialty }),
        {
          'Content-Type': 'application/json',
        }
      );
      enqueueSnackbar('Cause added successfully', { variant: 'success' });
      loadCauses();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(`Error adding cause: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const [errors, setErrors] = useState({
    email: '',
    address: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    availability: '',
    specialty: '',
    causes: '',
  });

  const validateName = (name: string) => {
    const regex = /^[A-Za-z]+$/;
    return regex.test(name);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const validationErrors = {
      email: '',
      address: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      availability: '',
      specialty: '',
      causes: '',
    };
    let isValid = true;

    // Validate email
    if (!validateEmail(email)) {
      validationErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!address) {
      validationErrors.address = 'Address is required.';
      isValid = false;
    }

    // Validate first name
    if (!validateName(firstName)) {
      validationErrors.firstName =
        'First name cannot contain numbers or special characters.';
      isValid = false;
    }

    // Validate last name
    if (!validateName(lastName)) {
      validationErrors.lastName =
        'Last name cannot contain numbers or special characters.';
      isValid = false;
    }

    // Validate password
    if (password.length < 8) {
      validationErrors.password =
        'Password must be at least 8 characters long.';
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    // Validate specialty
    if (!selectedSpecialty) {
      validationErrors.specialty = 'Specialty is required.';
      isValid = false;
    }

    availability.map((day) => {
      if (day.from && !day.to) {
        validationErrors.availability =
          'Please fill in all availability fields.';
        enqueueSnackbar('Please fill in all availability fields.', {
          variant: 'error',
        });
        isValid = false;
      }
      if (!day.from && day.to) {
        validationErrors.availability =
          'Please fill in all availability fields.';
        enqueueSnackbar('Please fill in all availability fields.', {
          variant: 'error',
        });
        isValid = false;
      }
    });

    const generatedAvailability = generateAvailabilityObject(availability);
    if (Object.values(generatedAvailability).every((arr) => arr.length === 0)) {
      validationErrors.availability =
        'Availability for at least one day is required.';
      enqueueSnackbar('Availability for at least one day is required.', {
        variant: 'error',
      });
      isValid = false;
    }

    // Validate causes
    if (
      !selectedCauses ||
      (selectedCauses.length > 0 &&
        !selectedCauses.every((cause) => cause !== ''))
    ) {
      validationErrors.causes = 'All cause fields must be filled.';
      enqueueSnackbar('All cause fields must be filled.', { variant: 'error' });
      isValid = false;
    }

    setErrors(validationErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      const responseData = await postDoctorRequest(
        `http://${window.location.hostname}:5000/api/users/signup/doctor`,
        'POST',
        JSON.stringify({
          email,
          password,
          image:
            'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
          name: `Dr ${firstName} ${lastName}`,
          address,
          specialtyId: selectedSpecialty,
          causes: selectedCauses,
          availability: generateAvailabilityObject(availability),
        }),
        {
          'Content-Type': 'application/json',
        }
      );

      login(
        responseData.token,
        responseData.role,
        responseData.userId,
        responseData.profileId
      );
      enqueueSnackbar('You have been registered and logged in', {
        variant: 'success',
      });
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
      console.error(err);
    }

    setErrors({
      email: '',
      address: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      availability: '',
      specialty: '',
      causes: '',
    });
  };

  const generateAvailabilityObject = (
    availability: { from: Dayjs | null; to: Dayjs | null }[]
  ) => {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const availabilityObj: Partial<IDoctor['availability']> = {};

    availability.forEach((day, index) => {
      if (day.from && day.to) {
        const dayOfWeek = daysOfWeek[index] as keyof IDoctor['availability'];
        availabilityObj[dayOfWeek] = generateAvailability(
          day.from.format('HH:mm'),
          day.to.format('HH:mm')
        );
      }
    });

    return availabilityObj;
  };

  return (
    <div style={{ margin: '70px' }}>
      <Typography variant="h4" gutterBottom>
        Doctor Registration
      </Typography>
      {isLoading && <LoadingSpinner asOverlay />}
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              error={Boolean(errors.address)}
              helperText={errors.address}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
            />
          </Grid>
          <DoctorConfigSpecialty
            selectedSpecialty={selectedSpecialty}
            handleSpecialtyChange={handleSpecialtyChange}
            allSpecialties={allSpecialties}
            addNewSpecialty={handleSpecialtySubmit}
            error={errors.specialty}
          />
          <DoctorConfigCauses
            specialtyId={selectedSpecialty}
            selectedCauses={selectedCauses}
            setSelectedCauses={setSelectedCauses}
            allCauses={allCauses}
            addNewCause={handleCauseSubmit}
            error={errors.causes}
          />
          <Grid item xs={12}>
            <DoctorConfigAvailability
              availability={availability}
              setAvailability={setAvailability}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Confirm Password"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
            />
          </Grid>
          <Grid item xs={12} style={{ textAlign: 'right', marginTop: '20px' }}>
            <Link to="/login">
              <Button
                variant="outlined"
                style={{ marginRight: '10px', width: '100px' }}
              >
                Back
              </Button>
            </Link>
            <Button
              variant="contained"
              color="primary"
              disabled={
                !email ||
                !address ||
                !firstName ||
                !lastName ||
                !password ||
                !confirmPassword ||
                !selectedSpecialty ||
                !selectedCauses ||
                !availability
              }
              style={{ marginRight: '10px', width: '100px' }}
              onClick={handleRegister}
            >
              Register
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default RegisterDoctor;
