import { Router } from 'express';
import {
  registerController,
  loginController,
  meController,
  refreshController,
  logoutController,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../config/security.js';

export const authRouter = Router();

// Endpoints con Rate Limiter estricto (máx 5 peticiones cada 15 min por IP)
authRouter.post('/register', authLimiter, registerController);
authRouter.post('/login', authLimiter, loginController);

// Endpoints protegidos o de gestión de sesión
authRouter.get('/me', authMiddleware, meController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', logoutController);
