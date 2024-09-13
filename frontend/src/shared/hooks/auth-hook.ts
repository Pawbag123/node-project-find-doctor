import { useCallback, useEffect, useState } from 'react';

import { LoginState } from '../../types';

let logoutTimer: ReturnType<typeof setTimeout>;

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState<Date | null>(
    null
  );
  const [loginState, setLoginState] = useState<LoginState>(
    LoginState.NotLoggedIn
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const login = useCallback(
    (
      token: string,
      role: string,
      userId: string,
      profileId: string,
      expirationDate?: Date
    ) => {
      setToken(token);
      setUserId(userId);
      setProfileId(profileId);
      const tokenExpirationDate =
        expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
      setTokenExpirationDate(tokenExpirationDate);
      localStorage.setItem(
        'userData',
        JSON.stringify({
          token,
          role,
          userId,
          profileId,
          expiration: tokenExpirationDate.toISOString(),
        })
      );
      if (role === 'doctor') {
        setLoginState(LoginState.Doctor);
      } else if (role === 'patient') {
        setLoginState(LoginState.Patient);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    setProfileId(null);
    localStorage.removeItem('userData');
    setLoginState(LoginState.NotLoggedIn);
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.token,
        storedData.role,
        storedData.userId,
        storedData.profileId,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { token, login, logout, userId, profileId, loginState };
};
