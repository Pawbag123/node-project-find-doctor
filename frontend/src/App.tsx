import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

// import './App.css';
import MainPage from './main/pages/MainPage';
import PatientProfile from './patients/pages/PatientProfile';
import DoctorProfile from './doctors/pages/DoctorProfile';
import DoctorConfig from './doctors/pages/DoctorConfig';
import RegisterPatient from './patients/pages/RegisterPatient';
import RegisterDoctor from './doctors/pages/RegisterDoctor';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import DoctorForAppointment from './main/pages/DoctorForAppointment';
import Auth from './main/pages/Auth';
import { AuthContext } from './shared/context/auth-context';
import { LoginState } from './types';
import { useAuth } from './shared/hooks/auth-hook';

const App = () => {
  const { login, logout, token, userId, profileId, loginState } = useAuth();

  let routes: JSX.Element;

  switch (loginState) {
    case LoginState.NotLoggedIn:
      routes = (
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />
          <Route path="/login" element={<Auth />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
      break;

    case LoginState.Patient:
      routes = (
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/:doctorId/appointment"
            element={<DoctorForAppointment />}
          />
          <Route path="/patient" element={<PatientProfile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
      break;

    case LoginState.Doctor:
      routes = (
        <Routes>
          <Route path="/doctor" element={<DoctorProfile />} />
          <Route path="/doctor/config" element={<DoctorConfig />} />
          <Route path="*" element={<Navigate to="/doctor" />} />
        </Routes>
      );
      break;
  }
  return (
    <SnackbarProvider maxSnack={3}>
      <AuthContext.Provider
        value={{
          loginState,
          token,
          userId,
          profileId,
          login,
          logout,
        }}
      >
        <Router>
          <MainNavigation />
          {routes}
        </Router>
      </AuthContext.Provider>
    </SnackbarProvider>
  );
};

export default App;
