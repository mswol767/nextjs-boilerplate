const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Setting up database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Create the events table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "start" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "events_pkey" PRIMARY KEY ("id")
      )
    `;
    
    console.log('✅ Events table created/verified');
    
    // Test insert and delete
    const testEvent = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'This is a test event',
        start: new Date()
      }
    });
    
    console.log('✅ Test event created:', testEvent.id);
    
    await prisma.event.delete({
      where: { id: testEvent.id }
    });
    
    console.log('✅ Test event deleted');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
