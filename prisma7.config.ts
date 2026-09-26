import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // If you are using tsx (recommended):
    seed: "npx tsx prisma/seed.ts",
    
    // OR if you are using ts-node:
    // seed: "npx ts-node prisma/seed.ts",
    
    // OR if you are using bun:
    // seed: "bun ./prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});