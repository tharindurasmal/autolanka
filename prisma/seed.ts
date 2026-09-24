import { VehicleType } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/utils";

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const BRANDS: { name: string; type: VehicleType; models: string[] }[] = [
  { name: "Toyota", type: VehicleType.CAR,
    models: ["Aqua", "Prius", "Corolla", "Axio", "Allion", "Premio", "Vitz", "Land Cruiser", "Hilux", "CHR"] },
  { name: "Honda", type: VehicleType.CAR,
    models: ["Fit", "Vezel", "Civic", "Grace", "Insight", "CR-V"] },
  { name: "Nissan", type: VehicleType.CAR,
    models: ["Leaf", "X-Trail", "March", "Sunny", "Bluebird"] },
  { name: "Suzuki", type: VehicleType.CAR,
    models: ["Alto", "Wagon R", "Swift", "Every", "Spacia"] },
  { name: "Mitsubishi", type: VehicleType.CAR,
    models: ["Montero", "Lancer", "Outlander", "Canter"] },
  { name: "Bajaj", type: VehicleType.THREE_WHEELER,
    models: ["RE", "Maxima", "Pulsar", "Discover"] },
  { name: "Yamaha", type: VehicleType.MOTORCYCLE,
    models: ["FZ", "Ray ZR", "MT-15", "Fascino"] },
  { name: "TVS", type: VehicleType.MOTORCYCLE,
    models: ["Apache", "Ntorq", "Jupiter"] },
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
  .finally(() => prisma.$disconnect());