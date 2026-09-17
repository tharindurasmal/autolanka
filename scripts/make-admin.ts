import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

const email = process.argv[2] || "admin@autolanka.com";
const password = process.argv[3] || "Admin123456";
const name = process.argv[4] || "Admin";

async function main() {
  if (!email || !email.includes("@")) {
    throw new Error("Provide an email as the first argument, e.g. npx tsx scripts/make-admin.ts admin@autolanka.com");
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
    console.log(`Created new user: ${email}`);
  } catch (error: any) {
    if (error?.status !== 422 && error?.status !== 409 && !String(error?.message || "").toLowerCase().includes("already")) {
      console.warn("signUpEmail warning:", error?.message || error);
    }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", name },
    create: {
      id: crypto.randomUUID(),
      name,
      email,
      emailVerified: true,
      role: "ADMIN",
    },
  });

  console.log("Admin account ready.");
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log("Login URL: http://localhost:3000/login");
}

main()
  .catch((error) => {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
