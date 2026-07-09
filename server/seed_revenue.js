const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding mock revenue data...');

  // Find an instructor
  const instructor = await prisma.user.findFirst({
    where: { role: 'instructor' }
  });

  if (!instructor) {
    console.log('No instructor found!');
    return;
  }

  // Find their courses
  let courses = await prisma.course.findMany({
    where: { instructor_id: instructor.id }
  });

  if (courses.length === 0) {
    // maybe create a mock course
    const newCourse = await prisma.course.create({
      data: {
        id: 'mock-course-' + Date.now(),
        title: 'Lập trình Node.js thực chiến',
        slug: 'lap-trinh-node-js-' + Date.now(),
        description: 'Khóa học Node.js',
        instructor_id: instructor.id,
        price: 500000,
        status: 'active'
      }
    });
    courses = [newCourse];
  }

  console.log(`Found ${courses.length} courses for instructor ${instructor.name || instructor.id}`);

  // Create random revenues for the last 6 months
  const now = new Date();
  const revenues = [];

  for (let i = 0; i < 150; i++) {
    const course = courses[Math.floor(Math.random() * courses.length)];
    
    // random date within the last 180 days
    const randomDays = Math.floor(Math.random() * 180);
    const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
    
    // random price between 200k and 1000k
    const gross_amount = Math.floor(Math.random() * 8 + 2) * 100000;
    const platform_fee = gross_amount * 0.3; // 30%
    const instructor_amount = gross_amount - platform_fee; // 70%

    revenues.push({
      instructor_id: instructor.id,
      course_id: course.id,
      gross_amount,
      instructor_amount,
      platform_fee_amount: platform_fee,
      status: 'available', // available so it counts
      earned_at: date,
      created_at: date,
      updated_at: date
    });
  }

  // Insert to DB
  await prisma.revenue.createMany({
    data: revenues
  });

  console.log(`Inserted ${revenues.length} mock revenue records successfully!`);
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
