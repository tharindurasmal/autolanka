import { VehicleType, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/utils"; // Adjust path if needed

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const BRANDS: { name: string; type: VehicleType; models: string[] }[] = [
  // --- CARS ---
  { name: "Toyota", type: VehicleType.CAR, models: ["Aqua", "Prius", "Corolla", "Axio", "Allion", "Premio", "Vitz"] },
  { name: "Honda", type: VehicleType.CAR, models: ["Fit", "Civic", "Grace", "Insight"] },
  { name: "Nissan", type: VehicleType.CAR, models: ["Leaf", "March", "Sunny", "Bluebird"] },
  { name: "Suzuki", type: VehicleType.CAR, models: ["Alto", "Wagon R", "Swift", "Every", "Spacia"] },
  { name: "Mitsubishi", type: VehicleType.CAR, models: ["Lancer"] },

  // --- SUVS ---
  { name: "Toyota", type: VehicleType.SUV, models: ["Land Cruiser", "CHR"] },
  { name: "Honda", type: VehicleType.SUV, models: ["Vezel", "CR-V"] },
  { name: "Nissan", type: VehicleType.SUV, models: ["X-Trail"] },
  { name: "Mitsubishi", type: VehicleType.SUV, models: ["Montero", "Outlander"] },

  // --- PICKUPS ---
  { name: "Toyota", type: VehicleType.PICKUP, models: ["Hilux"] },
  { name: "Isuzu", type: VehicleType.PICKUP, models: ["D-Max"] },
  { name: "Ford", type: VehicleType.PICKUP, models: ["Ranger"] },

  // --- LORRIES ---
  { name: "Mitsubishi", type: VehicleType.LORRY, models: ["Canter"] },

  // --- THREE WHEELERS ---
  { name: "Bajaj", type: VehicleType.THREE_WHEELER, models: ["RE", "Maxima", "Pulsar", "Discover"] },

  // --- MOTORCYCLES ---
  { name: "Yamaha", type: VehicleType.MOTORCYCLE, models: ["FZ", "Ray ZR", "MT-15", "Fascino"] },
  { name: "TVS", type: VehicleType.MOTORCYCLE, models: ["Apache", "Ntorq", "Jupiter"] },
];

async function main() {
  console.log("Seeding districts...");
  for (const name of DISTRICTS) {
    await prisma.district.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  console.log("Seeding brands and models...");
  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug_type: { slug: slugify(b.name), type: b.type } },
      update: {},
      create: { name: b.name, slug: slugify(b.name), type: b.type },
    });

    for (const m of b.models) {
      await prisma.model.upsert({
        where: { brandId_slug_type: { brandId: brand.id, slug: slugify(m), type: b.type } },
        update: {},
        create: { name: m, slug: slugify(m), brandId: brand.id, type: b.type },
      });
    }
  }

  console.log("Seed complete.");
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