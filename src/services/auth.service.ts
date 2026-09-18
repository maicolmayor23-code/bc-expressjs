import bcrypt from 'bcrypt';
import { usersRepository } from '../repositories/users.repository.js';
import { RegisterDto, LoginDto } from '../schemas/auth.schema.js';
import { AppError } from '../errors/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { JwtPayload } from '../types/jwt.types.js';
import { IUser } from '../models/user.model.js';

const SALT_ROUNDS = 10;

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(dto: RegisterDto) {
    const existingUser = await usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError(409, 'El email ya está registrado');
    }

    // Hashear contraseña con bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const newUser = await usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'user',
    });

    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    // 1. Buscar usuario con su password y refreshTokenHash
    const user = await usersRepository.findByEmailWithPassword(dto.email);

    // 2. Mismo mensaje de error genérico para email no encontrado y password incorrecta (Previene user enumeration)
    const INVALID_CREDENTIALS_MSG = 'Credenciales inválidas';

    if (!user || !user.password) {
      throw new AppError(401, INVALID_CREDENTIALS_MSG);
    }

    // 3. Verificar contraseña con bcrypt.compare
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, INVALID_CREDENTIALS_MSG);
    }

    // 4. Construir payload y firmar tokens
    const payload: JwtPayload = {
      sub: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // 5. Almacenar el hash del refresh token en la base de datos (seguridad por rúbrica)
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await usersRepository.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    let payload: JwtPayload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, 'Refresh token inválido o expirado');
    }

    const user = await usersRepository.findByIdWithRefreshToken(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new AppError(401, 'Acceso no autorizado o token revocado');
    }

    // Comparar hash del token enviado con el almacenado en BD
    const isValidToken = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValidToken) {
      // Si el token no coincide (posible reutilización maliciosa), revocamos la sesión
      await usersRepository.updateRefreshTokenHash(user._id.toString(), null);
      throw new AppError(401, 'Token de actualización inválido');
    }

    // ROTACIÓN DE TOKENS: Emitir un nuevo par de tokens
    const newPayload: JwtPayload = {
      sub: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // Guardar el hash del nuevo refresh token (invalidando el anterior)
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await usersRepository.updateRefreshTokenHash(user._id.toString(), newRefreshTokenHash);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // Invalida el refresh token en la BD
    await usersRepository.updateRefreshTokenHash(userId, null);
  }

  async getMe(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
