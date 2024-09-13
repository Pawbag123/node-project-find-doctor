import { createContext } from 'react';

import { LoginState } from '../../types';

type AuthContextType = {
  loginState: LoginState;
  token: string | null;
  userId: string | null;
  profileId: string | null;
  login: (
    token: string,
    role: string,
    userId: string,
    profileId: string,
    expirationDate?: Date
  ) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  loginState: LoginState.NotLoggedIn,
  token: null,
  userId: null,
  profileId: null,
  login: () => {},
  logout: () => {},
});
