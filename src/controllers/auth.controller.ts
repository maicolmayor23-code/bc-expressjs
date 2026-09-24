import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authService } from '../services/auth.service.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import { AppError } from '../errors/AppError.js';
import { verifyRefreshToken } from '../utils/jwt.js';

export async function registerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = registerSchema.parse(req.body);
    const user = await authService.register(dto);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = loginSchema.parse(req.body);
    const result = await authService.login(dto);

    // Establecer cookies HttpOnly
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      message: 'Inicio de sesión exitoso',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      throw new AppError(401, 'No autenticado');
    }

    const userProfile = await authService.getMe(userId);
    res.json({
      data: userProfile,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token no proporcionado');
    }

    const result = await authService.refreshTokens(refreshToken);

    // Actualizar cookies HttpOnly con los nuevos tokens rotados
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      message: 'Tokens renovados exitosamente',
      data: {
        user: result.user,
      },
    });
  } catch (err) {
    // Si falla el refresh, limpiamos las cookies
    clearAuthCookies(res);
    next(err);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.sub;
    
    if (userId) {
      await authService.logout(userId);
    } else {
      // Intentar obtener el id del refresh token si la cookie aún existe
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (refreshToken) {
        try {
          const payload = verifyRefreshToken(refreshToken);
          await authService.logout(payload.sub);
        } catch {
          // Ignorar error de verificación al hacer logout
        }
      }
    }

    // Limpiar cookies de la sesión
    clearAuthCookies(res);

    res.json({
      message: 'Sesión cerrada exitosamente',
    });
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
}
