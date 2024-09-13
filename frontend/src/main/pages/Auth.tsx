// Auth.tsx
import React, { useContext, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { AuthContext } from '../../shared/context/auth-context';
import { useSnackbar } from 'notistack';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Auth = () => {
  const { login } = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Form submission handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const responseData = await sendRequest(
        `http://${window.location.hostname}:5000/api/users/login`,
        'POST',
        JSON.stringify({
          email,
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
      enqueueSnackbar('You have been logged in', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
      console.error(err);
    }
  };

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', marginTop: 10, padding: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!email || !(password.length > 7)}
            fullWidth
          >
            Login
          </Button>
        </form>
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Link component={RouterLink} to="/register/doctor" variant="body2">
            Sign up as Doctor
          </Link>
          <Link component={RouterLink} to="/register/patient" variant="body2">
            Sign up as Patient
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Auth;
