const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper to generate a date N days ago with a random time
function randomDateDaysAgo(daysAgo) {
  const now = new Date();
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);

  // Random hour (0–23) and minute (0–59)
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);
  const randomSecond = Math.floor(Math.random() * 60);
  date.setHours(randomHour, randomMinute, randomSecond, 0);

  return date;
}

async function main() {
  // Create or find a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@journals.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'demo@journals.com',
      password: 'demo1234', // Note: hash in real use
      name: 'Demo User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Load journal entries from JSON
  const journalPath = path.join(__dirname, 'demoJournals.json');
  const rawData = fs.readFileSync(journalPath);
  const journalEntries = JSON.parse(rawData);

  // Optional: delete existing journal entries for this user
  await prisma.journal.deleteMany({ where: { authorId: user.id } });

  const now = new Date();

  for (let i = 0; i < journalEntries.length; i++) {
    const entry = journalEntries[i];

    // Spread entries randomly across the last 30 days
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = randomDateDaysAgo(randomDaysAgo);

    await prisma.journal.create({
      data: {
        id: randomUUID(),
        ...entry,
        authorId: user.id,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  console.log(`Seed complete: ${journalEntries.length} journal entries created for ${user.email}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Seed error:', err);
    prisma.$disconnect().finally(() => process.exit(1));
  });