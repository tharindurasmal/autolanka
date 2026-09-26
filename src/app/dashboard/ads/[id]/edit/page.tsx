import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notFound } from "next/navigation";
import { EditListingForm } from "@/components/edit-listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [listing, brands, districts] = await Promise.all([
    prisma.listing.findFirst({
      where: { id, userId: user.id },
      include: {
        images: { orderBy: { order: "asc" } },
        brand: true,
        model: true,
        district: true,
        city: true, // Included relational city object
      },
    }),
    prisma.brand.findMany({
      include: { models: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.district.findMany({
      include: {
        cities: { orderBy: { name: "asc" } }, // Included relational cities list
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Edit ad</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Update your listing</h1>
      </div>

      <EditListingForm listing={listing} brands={brands} districts={districts} />
    </div>
  );
}