import * as categoryRepo from '../repositories/category.repository.js';
import { AppError } from '../errors/AppError.js';
import type { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema.js';
import type { ICategory } from '../models/category.model.js';

export async function getAllCategories(): Promise<ICategory[]> {
  return await categoryRepo.findAll();
}

export async function getCategoryById(id: string): Promise<ICategory> {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw new AppError(404, 'Categoría no encontrada');
  }
  return category;
}

export async function createCategory(dto: CreateCategoryDto): Promise<ICategory> {
  return await categoryRepo.create(dto);
}

export async function updateCategory(
  id: string,
  dto: UpdateCategoryDto,
): Promise<ICategory> {
  const category = await categoryRepo.update(id, dto);
  if (!category) {
    throw new AppError(404, 'Categoría no encontrada');
  }
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await categoryRepo.remove(id);
  if (!category) {
    throw new AppError(404, 'Categoría no encontrada');
  }
}
