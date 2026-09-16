import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { markAsSold } from "@/server/actions/listing";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default async function MyAdsPage() {
  const user = await requireUser();

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My ads</h1>
        <Link href="/sell" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          + Post new ad
        </Link>
      </div>

      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="flex items-center gap-4 rounded-xl border bg-white p-3">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {l.images[0] && (
                <Image src={l.images[0].url} alt={l.title} fill className="object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{l.title}</p>
              <p className="text-sm text-gray-500">{formatPrice(l.price)}</p>
            </div>

            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[l.status]}`}>
              {l.status}
            </span>

            <div className="flex gap-2">
              <Link href={`/dashboard/ads/${l.id}/edit`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                Edit
              </Link>
              {l.status === "ACTIVE" && (
                <form action={markAsSold.bind(null, l.id)}>
                  <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                    Mark sold
                  </button>
                </form>
              )}
              <DeleteListingButton listingId={l.id} />
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <p className="rounded-lg border border-dashed p-12 text-center text-gray-500">
            You haven't posted any ads yet.
          </p>
        )}
      </div>
    </div>
  );
}