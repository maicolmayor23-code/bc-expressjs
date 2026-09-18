import type { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema.js';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.getCategoryById(req.params.id as string);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(dto);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = updateCategorySchema.parse(req.body);
    const updated = await categoryService.updateCategory(req.params.id as string, dto);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
