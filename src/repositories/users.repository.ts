import { User, IUser } from '../models/user.model.js';

export class UsersRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokenHash');
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByIdWithRefreshToken(id: string): Promise<IUser | null> {
    return User.findById(id).select('+refreshTokenHash');
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string | null): Promise<void> {
    await User.findByIdAndUpdate(id, { refreshTokenHash });
  }
}

export const usersRepository = new UsersRepository();
