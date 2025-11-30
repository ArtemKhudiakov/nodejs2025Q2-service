import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';
const jwt = require('jsonwebtoken');
const { sign } = jwt;

const refreshTokenSecurityKey = process.env.JWT_SECRET_REFRESH_KEY || '';

const generateRefreshToken = (payload: any, options: SignOptions): string => {
  return sign(payload, refreshTokenSecurityKey, options);
};

export default generateRefreshToken;
