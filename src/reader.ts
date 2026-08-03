// ============================================
// READER — Lee el archivo de datos JSON
// ============================================

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Item } from './types.js';

/**
 * Lee el archivo de inventario de equipos (data/items.json) y parsea su contenido.
 * @returns Promesa que resuelve a un arreglo de equipos (Item[])
 */
export async function readItems(): Promise<Item[]> {
  const filePath = join(import.meta.dirname, '..', 'data', 'items.json');
  try {
    const rawData = await readFile(filePath, 'utf-8');
    const items = JSON.parse(rawData) as Item[];
    return items;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al leer o parsear el archivo de datos (${filePath}): ${message}`);
  }
}
