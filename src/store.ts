import type { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from './types.js';

// Store en memoria — simula una base de datos de equipos de DJ, sonido e iluminación
const items: Equipment[] = [
  {
    id: 1,
    name: 'Consola DJ Pioneer DDJ-FLX6',
    category: 'dj_gear',
    dailyRate: 45.0,
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Bafle Amplificado JBL EON715 1300W',
    category: 'sound',
    dailyRate: 35.0,
    isAvailable: true,
  },
  {
    id: 3,
    name: 'Cabeza Móvil LED Beam 230W RGBW',
    category: 'lights',
    dailyRate: 25.0,
    isAvailable: false,
  },
  {
    id: 4,
    name: 'Máquina de Humo Chauvet Hurricane 1200',
    category: 'effects',
    dailyRate: 20.0,
    isAvailable: true,
  },
];

let nextId = 5;

/**
 * Retorna todos los equipos almacenados
 */
export function getAll(): Equipment[] {
  return items;
}

/**
 * Busca y retorna un equipo por su ID, o undefined si no existe
 */
export function getById(id: number): Equipment | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Crea un nuevo equipo con ID autoincremental y lo guarda en el store
 */
export function create(data: CreateEquipmentDto): Equipment {
  const newItem: Equipment = {
    id: nextId++,
    ...data,
  };
  items.push(newItem);
  return newItem;
}

/**
 * Actualiza los campos de un equipo existente por ID
 */
export function update(id: number, data: UpdateEquipmentDto): Equipment | undefined {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existingItem = items[index];
  const updatedItem: Equipment = {
    ...existingItem,
    ...data,
    id: existingItem.id, // el ID no se modifica
  };

  items[index] = updatedItem;
  return updatedItem;
}

/**
 * Elimina un equipo por ID y retorna true si fue eliminado o false si no existía
 */
export function remove(id: number): boolean {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}
