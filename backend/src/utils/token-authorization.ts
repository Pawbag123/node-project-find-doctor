import { SignInToken, SignatureInput } from '../types/token';
import { defaultTokenOptions } from './default-values';
import crypto from 'crypto';

export class TokenAuthorization {
  static createSignature({
    secret,
    encodedHeader,
    encodedPayload,
  }: SignatureInput) {
    return crypto
      .createHmac('sha256', secret)
      .update(encodedHeader + '.' + encodedPayload)
      .digest('base64');
  }

  static sign({ payload, secret, options = {} }: SignInToken) {
    const initialOptions = { ...defaultTokenOptions, ...options };

    const encodedHeader = Buffer.from(
      JSON.stringify(initialOptions.header)
    ).toString('base64');

    const encodedPayload = Buffer.from(
      JSON.stringify({ ...payload, exp: Date.now() + initialOptions.expiresIn })
    ).toString('base64');

    const signature = this.createSignature({
      secret,
      encodedHeader,
      encodedPayload,
    });

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static decode(token: string) {
    const splitToken = token.split('.');
    if (splitToken.length !== 3) {
      throw new Error("Invalid token");
    }
    const [, encodedPayload] = splitToken;
    return JSON.parse(atob(encodedPayload));
  }

  static checkIfExpired(expiration: number) {
    if (Date.now() > expiration) {
      return true;
    }
    return false;
  }

  static verify(token: string, secret: string) {
    const splitToken = token.split('.');
    if (splitToken.length !== 3) {
      throw new Error('Invalid token');
    }

    const [encodedHeader, encodedPayload, signature] = splitToken;

    const newSignature = this.createSignature({
      secret,
      encodedHeader,
      encodedPayload,
    });

    if (newSignature !== signature) {
      throw new Error('Invalid token');
    }
    const decoded = this.decode(token);

    if (this.checkIfExpired(decoded.exp)) {
      throw new Error('Token expired');
    }

    return decoded;
  }
}
