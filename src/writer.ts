// ============================================
// WRITER — Escribe el reporte en output/report.json
// ============================================

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { Report } from './types.js';

/**
 * Guarda el reporte en formato JSON en el directorio output/report.json.
 * Crea el directorio de salida si no existe.
 */
export async function writeReport(report: Report): Promise<void> {
  const outputDir = join(import.meta.dirname, '..', 'output');
  const filePath = join(outputDir, 'report.json');

  try {
    // Crear el directorio output/ de manera recursiva si no existe
    await mkdir(outputDir, { recursive: true });

    // Serializar el objeto de reporte con indentación de 2 espacios
    const jsonContent = JSON.stringify(report, null, 2);

    // Escribir el archivo en disco
    await writeFile(filePath, jsonContent, 'utf-8');

    console.log(`\n✅ Reporte generado exitosamente en: ${filePath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al escribir el reporte en disco (${filePath}): ${message}`);
  }
}
