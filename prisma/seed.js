import { PrismaClient } from '@prisma/client';
import { PLANT_DATA } from '../src/data/plantData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding valves...');
  const valves = PLANT_DATA.valves;
  
  // Using createMany for better performance since we don't have unique constraint on tag now
  // We'll clean the table first to avoid duplicates on re-seed
  await prisma.valve.deleteMany({});
  
  await prisma.valve.createMany({
    data: valves.map(v => ({
      tag: v.tag || '?',
      zona: v.zona,
      marca: v.marca || null,
      serie: v.serie || null,
      kit: v.kit || null,
      assento: v.assento || null,
      dn: v.dn || null,
      tipo: v.tipo || null,
      ult_kit: v.ult_kit || null,
      ult_man: v.ult_man || null,
      fabricacao: v.fabricacao || null,
      atuador: v.atuador || null,
      lote: v.lote || null,
      mariposa: v.mariposa || null,
    }))
  });
  
  console.log(`✅ Seeded ${valves.length} valves.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
