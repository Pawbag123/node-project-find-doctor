export interface TokenHeader {
  alg: string;
  typ: string;
}

export interface TokenOptions {
  expiresIn?: number;
  header?: TokenHeader;
}

export interface SignInToken {
  payload: object;
  secret: string;
  options?: TokenOptions;
}

export interface SignatureInput {
  secret: string;
  encodedHeader: string;
  encodedPayload: string;
}

export interface DecodedToken {
  header: object;
  payload: object;
  signature: string;
}
