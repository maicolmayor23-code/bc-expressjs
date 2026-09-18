import mongoose from 'mongoose';
import { Category, type ICategory } from '../models/category.model.js';
import { AppError } from '../errors/AppError.js';
import type { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema.js';

function handleMongoError(err: unknown): never {
  if (err && typeof err === 'object') {
    const errorObj = err as { name?: string; code?: number };
    if (errorObj.name === 'CastError' || err instanceof mongoose.Error.CastError) {
      throw new AppError(400, 'ID inválido');
    }
    if (errorObj.code === 11000) {
      throw new AppError(409, 'Ya existe una categoría con ese nombre');
    }
  }
  throw err;
}

export async function findAll(): Promise<ICategory[]> {
  try {
    return await Category.find().sort({ createdAt: -1 }).lean<ICategory[]>();
  } catch (err) {
    handleMongoError(err);
  }
}

export async function findById(id: string): Promise<ICategory | null> {
  try {
    return await Category.findById(id).lean<ICategory>();
  } catch (err) {
    handleMongoError(err);
  }
}

export async function create(dto: CreateCategoryDto): Promise<ICategory> {
  try {
    const category = await Category.create(dto);
    return category.toObject() as ICategory;
  } catch (err) {
    handleMongoError(err);
  }
}

export async function update(id: string, dto: UpdateCategoryDto): Promise<ICategory | null> {
  try {
    return await Category.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).lean<ICategory>();
  } catch (err) {
    handleMongoError(err);
  }
}

export async function remove(id: string): Promise<ICategory | null> {
  try {
    return await Category.findByIdAndDelete(id).lean<ICategory>();
  } catch (err) {
    handleMongoError(err);
  }
}
