import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as Prisma.PrismaClientOptions);

async function main() {
  console.log('Starting seeding...');

  // 1. Seed Positions
  const positions = [
    { code: 'GK', name: 'Goalkeeper', description: 'Thủ môn' },
    { code: 'DF', name: 'Defender', description: 'Hậu vệ' },
    { code: 'MF', name: 'Midfielder', description: 'Tiền vệ' },
    { code: 'FW', name: 'Forward', description: 'Tiền đạo' },
  ];

  for (const pos of positions) {
    await prisma.position.upsert({
      where: { code: pos.code },
      update: {},
      create: pos,
    });
  }
  console.log('Seeded positions.');

  // 2. Seed Countries
  const countries = [
    { code: 'VN', name: 'Vietnam', description: 'Việt Nam' },
    { code: 'US', name: 'United States', description: 'Mỹ' },
    { code: 'JP', name: 'Japan', description: 'Nhật Bản' },
    { code: 'BR', name: 'Brazil', description: 'Brazil' },
  ];

  for (const country of countries) {
    const existing = await prisma.country.findFirst({
      where: { code: country.code },
    });
    if (!existing) {
      await prisma.country.create({
        data: country,
      });
    }
  }
  console.log('Seeded countries.');

  // 3. Seed Users (Admin account)
  const adminEmail = 'admin@wc2026.com';
  const adminUser = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    await prisma.user.create({
      data: {
        username: 'admin',
        email: adminEmail,
        name: 'Super Admin',
        password: 'Admin@123',
      },
    });
    console.log('Seeded admin user.');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
