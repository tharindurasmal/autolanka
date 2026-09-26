import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { Pagination } from "@/components/pagination";
import type { Prisma, VehicleType, FuelType, Transmission } from "@prisma/client";

const PAGE_SIZE = 20;

interface SearchParams {
  model?: string;
  type?: string;
  brand?: string;
  district?: string;
  city?: string;
  fuel?: string;
  transmission?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  q?: string;
  page?: string;
}

export const metadata = { title: "Browse vehicles" };

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    ...(params.model && {
      OR: [
        { title: { contains: params.model, mode: "insensitive" } },
        {
          model: {
            is: {
              OR: [
                { name: { contains: params.model, mode: "insensitive" } },
                { slug: { contains: params.model, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    }),
    ...(params.type && { vehicleType: params.type as VehicleType }),
    ...(params.brand && { brand: { slug: params.brand } }),
    ...(params.district && { district: { slug: params.district } }),
    ...(params.city && { city: { slug: params.city } }), // Added relational city filtering
    ...(params.fuel && { fuelType: params.fuel as FuelType }),
    ...(params.transmission && { transmission: params.transmission as Transmission }),
    ...(params.minYear || params.maxYear
      ? {
          year: {
            ...(params.minYear && { gte: Number(params.minYear) }),
            ...(params.maxYear && { lte: Number(params.maxYear) }),
          },
        }
      : {}),
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

  const [listings, total, brands, districts, modelSuggestions] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { 
        images: { orderBy: { order: "asc" }, take: 1 }, 
        brand: true, 
        district: true,
        city: true // Included relational city object
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({
      include: {
        cities: { orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.model.findMany({
      select: { name: true, slug: true },
      distinct: ["slug"],
      orderBy: { name: "asc" },
      take: 200,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="bg-slate-100">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-6">
        <div className="mb-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Sri Lanka best vehicle marketplace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Displaying {total} search results
          </p>
        </div>

        <div className="space-y-5">
          <FilterSidebar
            brands={brands}
            districts={districts}
            modelSuggestions={modelSuggestions.map((model) => model.name)}
          />

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
              No vehicles match your filters.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}