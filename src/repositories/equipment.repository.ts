import mongoose from 'mongoose';
import { Equipment, type IEquipment } from '../models/equipment.model.js';
import { AppError } from '../errors/AppError.js';
import type { CreateEquipmentDto, UpdateEquipmentDto } from '../schemas/equipment.schema.js';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

function handleMongoError(err: unknown): never {
  if (err && typeof err === 'object') {
    const errorObj = err as { name?: string; code?: number };
    if (errorObj.name === 'CastError' || err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    if (errorObj.code === 11000) {
      throw new AppError(409, 'Ya existe un equipo registrado con ese número de serie');
    }
  }
  throw err;
}

export async function findAll(
  page: number,
  limit: number,
): Promise<PaginatedResult<IEquipment>> {
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      Equipment.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate('createdBy', 'name email role')
        .lean<IEquipment[]>(),
      Equipment.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    handleMongoError(err);
  }
}

export async function findById(id: string): Promise<IEquipment | null> {
  try {
    return await Equipment.findById(id)
      .populate('category')
      .populate('createdBy', 'name email role')
      .lean<IEquipment>();
  } catch (err) {
    handleMongoError(err);
  }
}

export async function create(dto: CreateEquipmentDto, userId?: string): Promise<IEquipment> {
  try {
    const equipmentData = userId ? { ...dto, createdBy: userId } : dto;
    const equipment = await Equipment.create(equipmentData);
    const populated = await equipment.populate([
      { path: 'category' },
      { path: 'createdBy', select: 'name email role' },
    ]);
    return populated.toObject() as IEquipment;
  } catch (err) {
    handleMongoError(err);
  }
}

export async function update(id: string, dto: UpdateEquipmentDto): Promise<IEquipment | null> {
  try {
    return await Equipment.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    })
      .populate('category')
      .populate('createdBy', 'name email role')
      .lean<IEquipment>();
  } catch (err) {
    handleMongoError(err);
  }
}

export async function remove(id: string): Promise<IEquipment | null> {
  try {
    return await Equipment.findByIdAndDelete(id).lean<IEquipment>();
  } catch (err) {
    handleMongoError(err);
  }
}
