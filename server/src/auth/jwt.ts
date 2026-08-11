import jwt, { type JwtPayload } from 'jsonwebtoken';
import { config } from '../config';

export function signToken(payload: object): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyToken(token: string): string | JwtPayload {
  return jwt.verify(token, config.jwtSecret, {
    algorithms: ['none', 'HS256'],
  });
}
