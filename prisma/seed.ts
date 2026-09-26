import { VehicleType, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/utils";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DISTRICTS_WITH_CITIES: { name: string; cities: string[] }[] = [
  { 
    name: "Colombo", 
    cities: ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Sri Jayawardenepura Kotte", "Maharagama", "Kesbewa", "Kolonnawa", "Thimbirigasyaya", "Padukka", "Homagama", "Kaduwela"] 
  },
  { 
    name: "Gampaha", 
    cities: ["Gampaha", "Negombo", "Katunayake", "Ja-Ela", "Wattala", "Kadawatha", "Kelaniya", "Minuwangoda", "Divulapitiya", "Mirigama", "Attanagalla", "Biyagama"] 
  },
  { 
    name: "Kalutara", 
    cities: ["Kalutara", "Panadura", "Horana", "Beruwala", "Aluthgama", "Mathugama", "Bandaragama", "Ingiriya", "Bulathsinhala"] 
  },
  { 
    name: "Kandy", 
    cities: ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya", "Kundasale", "Teldeniya", "Akurana", "Kadugannawa", "Pilimatalawa"] 
  },
  { 
    name: "Matale", 
    cities: ["Matale", "Dambulla", "Sigiriya", "Rattota", "Galewela", "Yatawatta"] 
  },
  { 
    name: "Nuwara Eliya", 
    cities: ["Nuwara Eliya", "Hatton", "Talawakele", "Ginigathhena", "Maskeliya", "Ragala"] 
  },
  { 
    name: "Galle", 
    cities: ["Galle", "Ambalangoda", "Hikkaduwa", "Elpitiya", "Karapitiya", "Baddegama", "Bentota"] 
  },
  { 
    name: "Matara", 
    cities: ["Matara", "Weligama", "Dikwella", "Hakmana", "Kamburupitiya", "Akuressa"] 
  },
  { 
    name: "Hambantota", 
    cities: ["Hambantota", "Tangalle", "Tissamaharama", "Ambalantota", "Beliatta", "Weeraketiya"] 
  },
  { 
    name: "Jaffna", 
    cities: ["Jaffna", "Chavakachcheri", "Point Pedro", "Valvettithurai", "Chunnakam", "Nallur"] 
  },
  { 
    name: "Kilinochchi", 
    cities: ["Kilinochchi", "Paranthan", "Pallai"] 
  },
  { 
    name: "Mannar", 
    cities: ["Mannar", "Pesalai", "Murunkan"] 
  },
  { 
    name: "Vavuniya", 
    cities: ["Vavuniya", "Cheddikulam"] 
  },
  { 
    name: "Mullaitivu", 
    cities: ["Mullaitivu", "Puthukudiyiruppu", "Oddusuddan"] 
  },
  { 
    name: "Batticaloa", 
    cities: ["Batticaloa", "Kattankudy", "Eravur", "Kalkudah", "Valachchenai"] 
  },
  { 
    name: "Ampara", 
    cities: ["Ampara", "Akkaraipattu", "Kalmunai", "Sammanthurai", "Pottuvil", "Dehiattakandiya"] 
  },
  { 
    name: "Trincomalee", 
    cities: ["Trincomalee", "Kantalai", "Kinniya", "Muttur"] 
  },
  { 
    name: "Kurunegala", 
    cities: ["Kurunegala", "Kuliyapitiya", "Narammala", "Pannala", "Nikaweratiya", "Maho", "Giriulla"] 
  },
  { 
    name: "Puttalam", 
    cities: ["Puttalam", "Chilaw", "Wennappuwa", "Marawila", "Dankotuwa", "Kalpitiya"] 
  },
  { 
    name: "Anuradhapura", 
    cities: ["Anuradhapura", "Kekirawa", "Mihintale", "Eppawala", "Medawachchiya"] 
  },
  { 
    name: "Polonnaruwa", 
    cities: ["Polonnaruwa", "Hingurakgoda", "Kaduruwela", "Medirigiriya"] 
  },
  { 
    name: "Badulla", 
    cities: ["Badulla", "Bandarawela", "Haputale", "Welimada", "Mahiyanganaya", "Diyatalawa"] 
  },
  { 
    name: "Monaragala", 
    cities: ["Monaragala", "Wellawaya", "Buttala", "Bibile", "Kataragama"] 
  },
  { 
    name: "Ratnapura", 
    cities: ["Ratnapura", "Embilipitiya", "Balangoda", "Pelmadulla", "Eheliyagoda", "Kuruwita"] 
  },
  { 
    name: "Kegalle", 
    cities: ["Kegalle", "Mawanella", "Warakapola", "Rambukkana", "Deraniyagala", "Yatiyantota"] 
  },
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
  console.log("Seeding districts and cities...");
  for (const item of DISTRICTS_WITH_CITIES) {
    const district = await prisma.district.upsert({
      where: { slug: slugify(item.name) },
      update: {},
      create: { name: item.name, slug: slugify(item.name) },
    });

    for (const cityName of item.cities) {
      await prisma.city.upsert({
        where: { districtId_slug: { districtId: district.id, slug: slugify(cityName) } },
        update: {},
        create: { name: cityName, slug: slugify(cityName), districtId: district.id },
      });
    }
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