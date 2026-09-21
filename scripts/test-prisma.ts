import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const total = await prisma.listing.count();
    console.log('listing count:', total);
  } catch (err) {
    console.error('prisma error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
