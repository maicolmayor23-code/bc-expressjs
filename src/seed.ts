try {
  process.loadEnvFile();
} catch {
  // Ignorar si el archivo .env no existe o ya está cargado
}

import { connectDB, disconnectDB } from './lib/mongoose.js';
import { Category } from './models/category.model.js';
import { Equipment } from './models/equipment.model.js';
import { logger } from './config/logger.js';

async function seed() {
  logger.info('🌱 Iniciando proceso de seeding para DJ / Sonido y Luces...');

  await connectDB();

  try {
    // 1. Limpiar colecciones en el orden correcto (primero principal, luego secundaria)
    logger.info('🧹 Limpiando colecciones existentes...');
    await Equipment.deleteMany({});
    await Category.deleteMany({});

    // 2. Insertar Entidad Secundaria (Categorías de Equipos DJ / Sonido y Luces)
    logger.info('🏷️ Insertando categorías secundarias...');
    const categories = await Category.insertMany([
      {
        name: 'Sonido & Altavoces',
        description: 'Cabezales activos, subwoofers y monitores de estudio/escenario',
        active: true,
      },
      {
        name: 'Iluminación & Láseres',
        description: 'Cabezas móviles DMX, luces par LED y proyectores de efectos láser',
        active: true,
      },
      {
        name: 'Controladores DJ & Mixers',
        description: 'Reproductores multireproductor, mezcladores de canales y consolas DJ',
        active: true,
      },
      {
        name: 'Efectos Especiales & Humo',
        description: 'Máquinas de humo denso, chispa fría y cañones de confeti',
        active: true,
      },
    ]);

    logger.info(`✅ Se crearon ${categories.length} categorías.`);

    const [sonidoCat, ilumCat, djCat, efectosCat] = categories;

    // 3. Insertar Entidad Principal (Equipos referenciando los ObjectIds de las Categorías)
    logger.info('🔊 Insertando equipos principales...');
    const equipments = await Equipment.insertMany([
      {
        name: 'Altavoz Activo JBL EON715 1300W',
        serialNumber: 'JBL-EON715-001',
        brand: 'JBL Professional',
        dailyRate: 150000,
        isAvailable: true,
        category: sonidoCat._id,
      },
      {
        name: 'Subwoofer Activo Electro-Voice ELX200-18SP',
        serialNumber: 'EV-ELX18-002',
        brand: 'Electro-Voice',
        dailyRate: 220000,
        isAvailable: true,
        category: sonidoCat._id,
      },
      {
        name: 'Sistema de Reproductor Pioneer DJ XDJ-XZ',
        serialNumber: 'PIO-XDJXZ-901',
        brand: 'Pioneer DJ',
        dailyRate: 450000,
        isAvailable: true,
        category: djCat._id,
      },
      {
        name: 'Mezclador Pioneer DJM-900NXS2 4-Canales',
        serialNumber: 'PIO-DJM900-441',
        brand: 'Pioneer DJ',
        dailyRate: 300000,
        isAvailable: false,
        category: djCat._id,
      },
      {
        name: 'Cabeza Móvil LED Chauvet DJ Intimidator Spot 360',
        serialNumber: 'CHV-SPOT360-11',
        brand: 'Chauvet DJ',
        dailyRate: 120000,
        isAvailable: true,
        category: ilumCat._id,
      },
      {
        name: 'Barra Par LED RGBW BeamZ LCB144',
        serialNumber: 'BMZ-LCB144-88',
        brand: 'BeamZ',
        dailyRate: 80000,
        isAvailable: true,
        category: ilumCat._id,
      },
      {
        name: 'Máquina de Humo Bajo Chauvet Cumulus 1500W',
        serialNumber: 'CHV-CUMULUS-05',
        brand: 'Chauvet DJ',
        dailyRate: 180000,
        isAvailable: true,
        category: efectosCat._id,
      },
    ]);

    logger.info(`✅ Se crearon ${equipments.length} equipos con sus referencias asociadas.`);
    logger.info('🎉 Proceso de seed completado exitosamente.');
  } catch (error) {
    logger.error('❌ Error ejecutando el seed:', { error });
  } finally {
    await disconnectDB();
  }
}

seed();
