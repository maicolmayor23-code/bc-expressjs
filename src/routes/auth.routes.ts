import { Router } from 'express';
import {
  registerController,
  loginController,
  meController,
  refreshController,
  logoutController,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.get('/me', authMiddleware, meController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', logoutController);
