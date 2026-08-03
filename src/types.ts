// ============================================
// TIPOS — Dominio: DJ / Sonido y luces
// ============================================

// Interfaz para representar un equipo de DJ, sonido o iluminación
export interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  brand: string;
  powerWatts: number;
}

// Resumen estadístico que el procesador debe calcular
export interface ItemSummary {
  total: number;
  active: number;
  inactive: number;
  averagePrice: number;
  mostExpensive: Item;
  cheapest: Item;
  categories: string[];
}

// Reporte final que se escribirá en output/report.json
export interface Report {
  generatedAt: string;
  appliedFilter: string | null;
  summary: ItemSummary;
  items: Item[];
}
