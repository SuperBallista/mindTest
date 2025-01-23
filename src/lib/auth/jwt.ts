import jwt from 'jsonwebtoken';
import type { User } from '$lib/entities/User';
import dotenv from "dotenv"

dotenv.config();

const secret = process.env.JWT_SECRET || "jwt_secret"
const refreshSecret = process.env.JWT_REFRESH || 'jwt_refresh';
const localServer = process.env.LOCAL_DB === "true" || false;

export function createTokens(user: User) {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username }, 
    secret,
    { expiresIn: '3h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, username: user.username },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    localServer
  };
}