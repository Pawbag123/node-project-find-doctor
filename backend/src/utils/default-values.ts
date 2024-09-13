import { TokenOptions } from '../types/token';

export const defaultTokenOptions: TokenOptions = {
  expiresIn: 1 * 60 * 60 * 1000,
  header: {
    alg: 'HS256',
    typ: 'JWT',
  },
};
