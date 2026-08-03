// ============================================
// PROCESSOR — Filtra y calcula estadísticas
// ============================================

import type { Item, ItemSummary } from './types.js';

/**
 * Filtra los equipos por categoría (de manera insensible a mayúsculas/minúsculas).
 * Si categoryFilter es null, retorna todos los items.
 * Si no existen items para la categoría especificada, lanza un Error con las categorías disponibles.
 */
export function filterByCategory(items: Item[], categoryFilter: string | null): Item[] {
  if (!categoryFilter) {
    return items;
  }

  const normalizedFilter = categoryFilter.trim().toLowerCase();
  const filtered = items.filter(item => item.category.toLowerCase() === normalizedFilter);

  if (filtered.length === 0) {
    const availableCategories = Array.from(new Set(items.map(item => item.category)));
    throw new Error(
      `No se encontraron equipos para la categoría '${categoryFilter}'. ` +
      `Categorías disponibles: ${availableCategories.join(', ')}`
    );
  }

  return filtered;
}

/**
 * Calcula el resumen estadístico de un arreglo de equipos.
 */
export function calculateSummary(items: Item[]): ItemSummary {
  if (items.length === 0) {
    throw new Error('No es posible calcular estadísticas para un conjunto de datos vacío.');
  }

  const total = items.length;
  const active = items.filter(item => item.active).length;
  const inactive = total - active;

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = Math.round((totalPrice / total) * 100) / 100;

  // Encontrar el equipo más costoso y el más económico
  const mostExpensive = items.reduce((prev, current) => (current.price > prev.price ? current : prev), items[0]);
  const cheapest = items.reduce((prev, current) => (current.price < prev.price ? current : prev), items[0]);

  // Lista de categorías únicas
  const categories = Array.from(new Set(items.map(item => item.category)));

  return {
    total,
    active,
    inactive,
    averagePrice,
    mostExpensive,
    cheapest,
    categories,
  };
}
