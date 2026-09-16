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
      className="group overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/3 bg-gray-100">
        {listing.images[0] ? (
          <Image
            src={listing.images[0].url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No photo
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate font-medium">{listing.title}</p>
        <p className="mt-1 text-lg font-bold text-blue-600">{formatPrice(listing.price)}</p>
        <p className="mt-1 text-xs text-gray-500">
          {listing.mileage ? `${listing.mileage.toLocaleString()} km · ` : ""}
          {listing.district.name}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {listing.publishedAt
            ? formatDistanceToNow(listing.publishedAt, { addSuffix: true })
            : ""}
        </p>
      </div>
    </Link>
  );
}