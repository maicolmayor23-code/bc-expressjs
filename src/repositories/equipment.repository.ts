import type { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from '../types.js';

// Store en memoria — simula el acceso a base de datos de equipos DJ / Sonido y Luces
const items: Equipment[] = [
  {
    id: 1,
    name: 'Consola DJ Pioneer DDJ-FLX6',
    category: 'dj_gear',
    dailyRate: 45.0,
    isAvailable: true,
    createdAt: new Date('2026-01-10T10:00:00Z').toISOString(),
  },
  {
    id: 2,
    name: 'Bafle Amplificado JBL EON715 1300W',
    category: 'sound',
    dailyRate: 35.0,
    isAvailable: true,
    createdAt: new Date('2026-01-12T11:30:00Z').toISOString(),
  },
  {
    id: 3,
    name: 'Cabeza Móvil LED Beam 230W RGBW',
    category: 'lights',
    dailyRate: 25.0,
    isAvailable: false,
    createdAt: new Date('2026-01-15T14:15:00Z').toISOString(),
  },
  {
    id: 4,
    name: 'Máquina de Humo Chauvet Hurricane 1200',
    category: 'effects',
    dailyRate: 20.0,
    isAvailable: true,
    createdAt: new Date('2026-01-18T09:00:00Z').toISOString(),
  },
];

let nextId = 5;

/**
 * Retorna todos los equipos almacenados (copia defensiva)
 */
export async function findAll(): Promise<Equipment[]> {
  return items.map((item) => ({ ...item }));
}

/**
 * Busca y retorna un equipo por su ID, o undefined si no existe (copia defensiva)
 */
export async function findById(id: number): Promise<Equipment | undefined> {
  const item = items.find((e) => e.id === id);
  return item ? { ...item } : undefined;
}

/**
 * Crea un nuevo equipo con ID autoincremental y fecha de creación ISO
 */
export async function create(dto: CreateEquipmentDto): Promise<Equipment> {
  const newItem: Equipment = {
    id: nextId++,
    ...dto,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  return { ...newItem };
}

/**
 * Actualiza los campos de un equipo existente por ID
 */
export async function update(id: number, dto: UpdateEquipmentDto): Promise<Equipment | undefined> {
  const index = items.findIndex((e) => e.id === id);
  if (index === -1) {
    return undefined;
  }

  const existingItem = items[index];
  const updatedItem: Equipment = {
    ...existingItem,
    ...dto,
    id: existingItem.id, // El ID se preserva inmuta
  };

  items[index] = updatedItem;
  return { ...updatedItem };
}

/**
 * Elimina un equipo por ID. Retorna true si fue eliminado o false si no existía
 */
export async function remove(id: number): Promise<boolean> {
  const index = items.findIndex((e) => e.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}
