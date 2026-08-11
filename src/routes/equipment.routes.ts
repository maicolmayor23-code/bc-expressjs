import { Router } from 'express';
import * as store from '../store.js';
import type { CreateEquipmentDto, UpdateEquipmentDto } from '../types.js';

export const equipmentRouter = Router();

// GET /api/v1/equipment — Listar todos los equipos
// Status: 200 OK
equipmentRouter.get('/', (_req, res) => {
  const equipmentList = store.getAll();
  res.json({
    data: equipmentList,
    total: equipmentList.length,
  });
});

// GET /api/v1/equipment/:id — Obtener equipo por ID
// Status: 200 OK si existe | 404 Not Found si no existe
equipmentRouter.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID must be a valid number' });
    return;
  }

  const equipment = store.getById(id);
  if (!equipment) {
    res.status(404).json({ error: `Equipment with ID ${id} not found` });
    return;
  }

  res.json(equipment);
});

// POST /api/v1/equipment — Crear nuevo equipo
// Status: 201 Created con el recurso creado
equipmentRouter.post('/', (req, res) => {
  const { name, category, dailyRate, isAvailable } = req.body as Partial<CreateEquipmentDto>;

  // Validación básica
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
    return;
  }

  if (!category || !['sound', 'lights', 'dj_gear', 'effects'].includes(category)) {
    res.status(400).json({
      error: 'Field "category" is required and must be one of: sound, lights, dj_gear, effects',
    });
    return;
  }

  if (typeof dailyRate !== 'number' || dailyRate < 0) {
    res.status(400).json({ error: 'Field "dailyRate" must be a positive number' });
    return;
  }

  const newEquipment = store.create({
    name: name.trim(),
    category,
    dailyRate,
    isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
  });

  res.status(201).json(newEquipment);
});

// PUT /api/v1/equipment/:id — Actualizar equipo completo
// Status: 200 OK con el recurso actualizado | 404 Not Found si no existe
equipmentRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID must be a valid number' });
    return;
  }

  const updateDto = req.body as UpdateEquipmentDto;
  const updatedEquipment = store.update(id, updateDto);

  if (!updatedEquipment) {
    res.status(404).json({ error: `Equipment with ID ${id} not found` });
    return;
  }

  res.json(updatedEquipment);
});

// DELETE /api/v1/equipment/:id — Eliminar equipo
// Status: 204 No Content sin body | 404 Not Found si no existe
equipmentRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID must be a valid number' });
    return;
  }

  const removed = store.remove(id);
  if (!removed) {
    res.status(404).json({ error: `Equipment with ID ${id} not found` });
    return;
  }

  res.status(204).send();
});
