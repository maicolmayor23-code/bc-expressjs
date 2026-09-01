import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos para DJ / Sonido y Luces...');

  // 1. Categorías demo
  const djGearCategory = await prisma.category.upsert({
    where: { name: 'DJ Gear' },
    update: {},
    create: {
      name: 'DJ Gear',
      description: 'Consolas, controladores y reproductores para DJ profesional',
    },
  });

  const soundCategory = await prisma.category.upsert({
    where: { name: 'Sonido Profesional' },
    update: {},
    create: {
      name: 'Sonido Profesional',
      description: 'Bafles amplificados, subwoofers y sistemas Line Array',
    },
  });

  const lightsCategory = await prisma.category.upsert({
    where: { name: 'Iluminación y Láser' },
    update: {},
    create: {
      name: 'Iluminación y Láser',
      description: 'Cabezas móviles, focos PAR LED y efectos estroboscópicos',
    },
  });

  const effectsCategory = await prisma.category.upsert({
    where: { name: 'Efectos Especiales' },
    update: {},
    create: {
      name: 'Efectos Especiales',
      description: 'Máquinas de humo, nieve, CO2 y chispa fría',
    },
  });

  // 2. Equipos demo (al menos 5 registros idempotentes)
  const equipmentsData = [
    {
      serialNumber: 'DJ-PIONEER-FLX6-001',
      name: 'Consola DJ Pioneer DDJ-FLX6-GT',
      dailyRate: 45.0,
      isAvailable: true,
      categoryId: djGearCategory.id,
    },
    {
      serialNumber: 'SND-JBL-EON715-002',
      name: 'Bafle Amplificado JBL EON715 1300W',
      dailyRate: 35.0,
      isAvailable: true,
      categoryId: soundCategory.id,
    },
    {
      serialNumber: 'LGT-BEAM-230W-003',
      name: 'Cabeza Móvil LED Beam 230W RGBW',
      dailyRate: 25.0,
      isAvailable: false,
      categoryId: lightsCategory.id,
    },
    {
      serialNumber: 'EFF-CHAUVET-1200-004',
      name: 'Máquina de Humo Chauvet Hurricane 1200',
      dailyRate: 20.0,
      isAvailable: true,
      categoryId: effectsCategory.id,
    },
    {
      serialNumber: 'SND-QSC-K122-005',
      name: 'Altavoz Activo QSC K12.2 2000W',
      dailyRate: 50.0,
      isAvailable: true,
      categoryId: soundCategory.id,
    },
    {
      serialNumber: 'LGT-PARLED-18X12-006',
      name: 'Foco Par LED 18x12W RGBW DMX',
      dailyRate: 15.0,
      isAvailable: true,
      categoryId: lightsCategory.id,
    },
  ];

  for (const item of equipmentsData) {
    await prisma.equipment.upsert({
      where: { serialNumber: item.serialNumber },
      update: {
        name: item.name,
        dailyRate: item.dailyRate,
        isAvailable: item.isAvailable,
        categoryId: item.categoryId,
      },
      create: item,
    });
  }

  console.log('✅ Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
