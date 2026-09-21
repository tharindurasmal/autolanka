import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { Edit2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default async function MyAdsPage() {
  const user = await requireUser();

  const [listings, activeCount, pendingCount] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: user.id },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.listing.count({ where: { userId: user.id, status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Total ads", value: String(listings.length) },
    { label: "Active", value: String(activeCount) },
    { label: "Pending", value: String(pendingCount) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">My ads</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Your listings</h1>
        </div>
        <Link href="/sell" className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto">
          + Post new ad
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{stat.label}</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4">
            <div className="relative h-24 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-24 sm:flex-none">
              {l.images[0] ? (
                <Image src={l.images[0].url} alt={l.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-slate-500">No image</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold text-slate-900">{l.title}</p>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[l.status]}`}>
                  {l.status}
                </span>
              </div>
              <p className="text-sm text-slate-500">{formatPrice(l.price)}</p>
              {l.moderationNote && (l.status === "DRAFT" || l.status === "REJECTED") && (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <span className="font-semibold">Admin note:</span> {l.moderationNote}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-none sm:flex-row sm:justify-end">
              <Link href={`/dashboard/ads/${l.id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100 sm:px-3 sm:py-1.5">
                <Edit2 className="h-4 w-4" />
                {l.status === "DRAFT" || l.status === "REJECTED" ? "Edit & resubmit" : "Edit"}
              </Link>
              <DeleteListingButton listingId={l.id} />
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            You haven’t posted any ads yet.
          </p>
        )}
      </div>
    </div>
  );
}