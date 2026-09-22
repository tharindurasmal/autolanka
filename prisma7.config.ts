import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // 1. Tries DIRECT_URL (best for migrations)
    // 2. Falls back to DATABASE_URL (what you set in Vercel)
    // 3. Falls back to a dummy string (so GitHub Actions passes)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});