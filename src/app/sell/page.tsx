import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ListingForm } from "@/components/listing-form";

export const metadata = { title: "Post your ad" };

export default async function SellPage() {
  await requireUser();

  const [brands, districts] = await Promise.all([
    prisma.brand.findMany({
      include: { models: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Post your ad</h1>
      <p className="mb-8 text-sm text-gray-500">
        Your ad will go live immediately after publishing.
      </p>

      <ListingForm brands={brands} districts={districts} />
    </div>
  );
}