import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { AuthContext } from '../../context/auth-context';
import { LoginState } from '../../../types';
import './NavLinks.css';

const NavLinks = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { loginState, logout } = useContext(AuthContext);

  return (
    <ul className="nav-links">
      {(loginState === LoginState.NotLoggedIn ||
        loginState === LoginState.Patient) && (
        <li>
          <NavLink to="/">BROWSE DOCTORS</NavLink>
        </li>
      )}
      {loginState === LoginState.Doctor && (
        <li>
          <NavLink to="/doctor">MY DOCTOR PROFILE</NavLink>
        </li>
      )}
      {loginState === LoginState.Patient && (
        <li>
          <NavLink to="/patient">MY PATIENT PROFILE</NavLink>
        </li>
      )}
      {loginState === LoginState.NotLoggedIn && (
        <li>
          <NavLink to="/login">LOGIN</NavLink>
        </li>
      )}
      {loginState !== LoginState.NotLoggedIn && (
        <li>
          <button
            onClick={() => {
              logout();
              enqueueSnackbar('You have been logged out', {
                variant: 'success',
              });
            }}
          >
            LOGOUT
          </button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
