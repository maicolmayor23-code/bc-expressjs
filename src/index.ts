// ============================================
// ENTRY POINT — Orquesta el procesador de datos (DJ / Sonido y Luces)
// ============================================

import { readItems } from './reader.js';
import { filterByCategory, calculateSummary } from './processor.js';
import { writeReport } from './writer.js';
import type { Report } from './types.js';

/**
 * Función principal que orquesta la lectura, procesamiento y guardado de reportes de equipos.
 */
async function main(): Promise<void> {
  try {
    // 1. Parsear el argumento --category desde la línea de comandos
    const args = process.argv.slice(2);
    const categoryIndex = args.indexOf('--category');
    const categoryFilter: string | null =
      categoryIndex !== -1 && categoryIndex + 1 < args.length
        ? args[categoryIndex + 1]
        : null;

    console.log('🎧 Sistema de Gestión e Inventario — DJ / Sonido y Luces');
    console.log('======================================================');
    if (categoryFilter) {
      console.log(`🔍 Aplicando filtro por categoría: "${categoryFilter}"`);
    } else {
      console.log('🔍 Procesando todos los equipos del inventario (sin filtro)');
    }

    // 2. Leer los datos de inventario
    const allItems = await readItems();

    // 3. Filtrar por categoría (si se especificó una)
    const filteredItems = filterByCategory(allItems, categoryFilter);

    // 4. Calcular el resumen estadístico
    const summary = calculateSummary(filteredItems);

    // 5. Construir el objeto Report final
    const report: Report = {
      generatedAt: new Date().toISOString(),
      appliedFilter: categoryFilter,
      summary,
      items: filteredItems,
    };

    // 6. Imprimir resumen estructurado en la consola
    console.log('\n📊 Resumen del Inventario Procesado:');
    console.log(`   • Total de Equipos:      ${summary.total}`);
    console.log(`   • Equipos Activos:       ${summary.active}`);
    console.log(`   • Equipos Inactivos:     ${summary.inactive}`);
    console.log(`   • Precio Promedio:       $${summary.averagePrice.toFixed(2)} USD`);
    console.log(`   • Equipo Más Costoso:    ${summary.mostExpensive.name} ($${summary.mostExpensive.price} USD)`);
    console.log(`   • Equipo Más Económico:  ${summary.cheapest.name} ($${summary.cheapest.price} USD)`);
    console.log(`   • Categorías Incluidas:  ${summary.categories.join(', ')}`);

    // 7. Escribir el reporte en disco (output/report.json)
    await writeReport(report);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ ERROR EN LA EJECUCIÓN: ${message}`);
    process.exit(1);
  }
}

// Ejecutar el flujo principal
main();
