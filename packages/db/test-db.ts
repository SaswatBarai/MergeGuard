import { prisma } from './dist/index.js';

async function main() {
  try {
    console.log('Testing Database CRUD operations...');

    // 1. Create a user
    const user = await prisma.user.create({
      data: {
        githubId: 'test-github-id-' + Date.now(),
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        globalRole: 'ADMIN',
      },
    });
    console.log('✅ User created:', user.id);

    // 2. Read the user
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    console.log('✅ User found:', foundUser?.name);

    // 3. Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Updated Test User' },
    });
    console.log('✅ User updated:', updatedUser.name);

    // 4. Delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ User deleted');

    console.log('All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
