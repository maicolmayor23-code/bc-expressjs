process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret_super_secure_key_1234567890';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_super_secure_key_0987654321';

jest.mock('../repositories/users.repository.js');

import bcrypt from 'bcrypt';
import { authService } from '../services/auth.service.js';
import { usersRepository } from '../repositories/users.repository.js';
import { AppError } from '../errors/AppError.js';
import * as jwtUtils from '../utils/jwt.js';

const mockUsersRepo = usersRepository as jest.Mocked<typeof usersRepository>;

describe('AuthService — Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // register()
  // ─────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user successfully when email is not taken', async () => {
      const dto = { name: 'DJ Alex', email: 'alex@dj.com', password: 'Password123!', role: 'user' as const };

      mockUsersRepo.findByEmail.mockResolvedValue(null);
      mockUsersRepo.create.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        name: dto.name,
        email: dto.email,
        role: 'user',
      } as any);

      const result = await authService.register(dto);

      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('alex@dj.com');
      expect(mockUsersRepo.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: 'user-id-123',
        name: 'DJ Alex',
        email: 'alex@dj.com',
        role: 'user',
      });
    });

    it('should throw AppError(409) when email is already registered', async () => {
      const dto = { name: 'DJ Alex', email: 'alex@dj.com', password: 'Password123!', role: 'user' as const };

      mockUsersRepo.findByEmail.mockResolvedValue({ email: 'alex@dj.com' } as any);

      await expect(authService.register(dto)).rejects.toThrow(AppError);
      await expect(authService.register(dto)).rejects.toThrow('El email ya está registrado');
    });
  });

  // ─────────────────────────────────────────────
  // login()
  // ─────────────────────────────────────────────
  describe('login', () => {
    it('should return user info, accessToken and refreshToken on valid credentials', async () => {
      const dto = { email: 'alex@dj.com', password: 'Password123!' };
      const hashedPassword = await bcrypt.hash('Password123!', 1);

      mockUsersRepo.findByEmailWithPassword.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        name: 'DJ Alex',
        email: dto.email,
        password: hashedPassword,
        role: 'user',
      } as any);

      mockUsersRepo.updateRefreshTokenHash.mockResolvedValue(undefined);

      const result = await authService.login(dto);

      expect(mockUsersRepo.findByEmailWithPassword).toHaveBeenCalledWith(dto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual({
        id: 'user-id-123',
        name: 'DJ Alex',
        email: dto.email,
        role: 'user',
      });
    });

    it('should throw AppError(401) when user is not found', async () => {
      mockUsersRepo.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'notfound@dj.com', password: 'Password123!' })
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw AppError(401) when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword!', 1);

      mockUsersRepo.findByEmailWithPassword.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        email: 'alex@dj.com',
        password: hashedPassword,
        role: 'user',
      } as any);

      await expect(
        authService.login({ email: 'alex@dj.com', password: 'WrongPassword!' })
      ).rejects.toThrow('Credenciales inválidas');
    });
  });

  // ─────────────────────────────────────────────
  // refreshTokens()
  // ─────────────────────────────────────────────
  describe('refreshTokens', () => {
    it('should refresh tokens when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-id-123', name: 'DJ Alex', email: 'alex@dj.com', role: 'user' };
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 1);

      jest.spyOn(jwtUtils, 'verifyRefreshToken').mockReturnValue(payload as any);

      mockUsersRepo.findByIdWithRefreshToken.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        name: 'DJ Alex',
        email: 'alex@dj.com',
        role: 'user',
        refreshTokenHash: hashedRefreshToken,
      } as any);

      mockUsersRepo.updateRefreshTokenHash.mockResolvedValue(undefined);

      const result = await authService.refreshTokens(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw AppError(401) when refresh token verification fails', async () => {
      jest.spyOn(jwtUtils, 'verifyRefreshToken').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshTokens('invalid-token')).rejects.toThrow(
        'Refresh token inválido o expirado'
      );
    });

    it('should throw AppError(401) when user has no stored refreshTokenHash', async () => {
      const payload = { sub: 'user-id-123', name: 'DJ Alex', email: 'alex@dj.com', role: 'user' };
      jest.spyOn(jwtUtils, 'verifyRefreshToken').mockReturnValue(payload as any);

      mockUsersRepo.findByIdWithRefreshToken.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        refreshTokenHash: null,
      } as any);

      await expect(authService.refreshTokens('valid-token')).rejects.toThrow(
        'Acceso no autorizado o token revocado'
      );
    });

    it('should throw AppError(401) and revoke token if refreshToken does not match hash', async () => {
      const refreshToken = 'compromised-token';
      const payload = { sub: 'user-id-123', name: 'DJ Alex', email: 'alex@dj.com', role: 'user' };
      const otherHash = await bcrypt.hash('different-token', 1);

      jest.spyOn(jwtUtils, 'verifyRefreshToken').mockReturnValue(payload as any);

      mockUsersRepo.findByIdWithRefreshToken.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        refreshTokenHash: otherHash,
      } as any);

      await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(
        'Token de actualización inválido'
      );
      expect(mockUsersRepo.updateRefreshTokenHash).toHaveBeenCalledWith('user-id-123', null);
    });
  });

  // ─────────────────────────────────────────────
  // logout()
  // ─────────────────────────────────────────────
  describe('logout', () => {
    it('should clear refresh token hash on logout', async () => {
      mockUsersRepo.updateRefreshTokenHash.mockResolvedValue(undefined);

      await authService.logout('user-id-123');

      expect(mockUsersRepo.updateRefreshTokenHash).toHaveBeenCalledWith('user-id-123', null);
    });
  });

  // ─────────────────────────────────────────────
  // getMe()
  // ─────────────────────────────────────────────
  describe('getMe', () => {
    it('should return user profile if user exists', async () => {
      mockUsersRepo.findById.mockResolvedValue({
        _id: { toString: () => 'user-id-123' },
        name: 'DJ Alex',
        email: 'alex@dj.com',
        role: 'user',
      } as any);

      const result = await authService.getMe('user-id-123');

      expect(result).toEqual({
        id: 'user-id-123',
        name: 'DJ Alex',
        email: 'alex@dj.com',
        role: 'user',
      });
    });

    it('should throw AppError(404) when user is not found', async () => {
      mockUsersRepo.findById.mockResolvedValue(null);

      await expect(authService.getMe('nonexistent')).rejects.toThrow('Usuario no encontrado');
    });
  });
});
