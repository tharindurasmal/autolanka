import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Listing, ListingImage, Brand, District } from "@prisma/client";

type CardListing = Listing & {
  images: ListingImage[];
  brand: Brand;
  district: District;
};

export function ListingCard({ listing }: { listing: CardListing }) {
  return (
    <Link
      href={`/vehicles/${listing.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_10px_28px_rgba(14,116,144,0.08)]"
    >
      <div className="flex gap-3 p-2.5 sm:p-3">
        <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-40">
          {listing.images[0] ? (
            <Image
              src={listing.images[0].url}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, 220px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
              No photo
            </div>
          )}

          <div className="absolute left-2 top-2 rounded-full bg-slate-900/75 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
            {listing.vehicleType}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-5 text-slate-900">
                {listing.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {listing.district.name}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
              {listing.year}
            </span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-xl font-black leading-none text-sky-700">
              {formatPrice(listing.price)}
            </p>

            {listing.negotiable && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                Negotiable
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
            <span className="rounded-full bg-slate-100 px-2 py-1">
              {listing.fuelType}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1">
              {listing.transmission}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1">
              {listing.mileage != null
                ? `${listing.mileage.toLocaleString()} km`
                : "Mileage N/A"}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>{listing.brand.name}</span>
            <span>
              {listing.publishedAt
                ? formatDistanceToNow(listing.publishedAt, { addSuffix: true })
                : "Just now"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}