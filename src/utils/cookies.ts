import { Response } from 'express';

const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    path: '/api/v1/auth', // Se envía en peticiones de auth (/refresh, /logout)
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', {
    ...COOKIE_BASE_OPTIONS,
    path: '/',
  });
  res.clearCookie('refreshToken', {
    ...COOKIE_BASE_OPTIONS,
    path: '/api/v1/auth',
  });
}
