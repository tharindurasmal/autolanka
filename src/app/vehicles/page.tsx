import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { Pagination } from "@/components/pagination";
import type { Prisma, VehicleType } from "@prisma/client";

const PAGE_SIZE = 20;

interface SearchParams {
  type?: string;
  brand?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  page?: string;
}

export const metadata = { title: "Browse vehicles" };

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams; // Next.js 16: searchParams is a Promise
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    ...(params.type && { vehicleType: params.type as VehicleType }),
    ...(params.brand && { brand: { slug: params.brand } }),
    ...(params.district && { district: { slug: params.district } }),
    ...(params.minPrice || params.maxPrice
      ? {
          price: {
            ...(params.minPrice && { gte: Number(params.minPrice) }),
            ...(params.maxPrice && { lte: Number(params.maxPrice) }),
          },
        }
      : {}),
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ],
    }),
  };

  const [listings, total, brands, districts] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { images: { orderBy: { order: "asc" }, take: 1 }, brand: true, district: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <FilterSidebar brands={brands} districts={districts} />

        <div>
          <p className="mb-4 text-sm text-gray-500">{total} vehicles found</p>

          {listings.length === 0 ? (
            <p className="rounded-lg border border-dashed p-12 text-center text-gray-500">
              No vehicles match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}