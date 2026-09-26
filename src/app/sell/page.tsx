import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ListingForm } from "@/components/listing-form";

export const metadata = { title: "Post your ad" };

export default async function SellPage() {
  await requireUser();

  const [brands, districts] = await Promise.all([
    prisma.brand.findMany({
      include: { 
        models: { 
          orderBy: { name: "asc" } 
        } 
      },
      orderBy: { name: "asc" },
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">Post your ad</h1>
      <p className="mb-8 text-sm text-slate-500">
        Your ad will go live immediately after publishing.
      </p>

      <ListingForm brands={brands} districts={districts} />
    </div>
  );
}