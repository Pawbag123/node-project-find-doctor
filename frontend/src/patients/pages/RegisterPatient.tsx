import { useContext, useState } from 'react';
import { TextField, Button, FormControl, Box, Stack } from '@mui/material';

import './RegisterPatient.css';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { enqueueSnackbar } from 'notistack';
import { Link } from 'react-router-dom';

const RegisterPatient = () => {
  const { login } = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const validateName = (name: string) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(name);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    const validationErrors = {
      email: '',
      name: '',
      age: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!validateEmail(email)) {
      validationErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    // Validate first name
    if (!validateName(name)) {
      validationErrors.name =
        'Name cannot contain numbers or special characters.';
      isValid = false;
    }

    // Validate age
    if (!age) {
      validationErrors.age = 'Age is required.';
      isValid = false;
    } else if (age < 18) {
      validationErrors.age = 'You must be at least 18 years old.';
      isValid = false;
    } else if (age > 130) {
      validationErrors.age = 'Please enter a valid age.';
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

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      const responseData = await sendRequest(
        `http://${window.location.hostname}:5000/api/users/signup/patient`,
        'POST',
        JSON.stringify({
          email,
          name,
          age,
          password,
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

    // Reset error messages
    setErrors({
      email: '',
      name: '',
      age: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <form>
      <Stack spacing={2}>
        <h2 className="centered-heading">Register</h2>
        <Box className="form-group">
          <TextField
            label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
          />
        </Box>
        <Box className="form-group">
          <TextField
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
        </Box>
        <Box className="form-group">
          <FormControl fullWidth margin="normal">
            <TextField
              label="age"
              id="age"
              required
              type="number"
              variant="outlined"
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
              inputProps={{
                min: 18,
                max: 130,
              }}
            />
          </FormControl>
        </Box>
        <Box className="form-group">
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
        </Box>
        <Box className="form-group">
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
        </Box>
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
          disabled={!email || !name || !age || !password || !confirmPassword}
          style={{ marginRight: '10px', width: '100px' }}
          onClick={handleRegister}
        >
          Register
        </Button>
      </Stack>
    </form>
  );
};

export default RegisterPatient;
