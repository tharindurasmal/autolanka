import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireAdmin();

  const [listings, activeCount, pendingCount] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.listing.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.listing.count({ where: { userId: user.id, status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Total ads", value: String(listings.length ? listings.length : 0) },
    { label: "Active ads", value: String(activeCount) },
    { label: "Pending", value: String(pendingCount) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back, {user.name}</h1>
        </div>
        <Link href="/dashboard/ads" className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:w-auto">
          View all ads
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{stat.label}</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent listings</h2>
          <Link href="/dashboard/ads" className="text-sm font-semibold text-sky-600">Manage ads</Link>
        </div>

        <div className="space-y-3">
          {listings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              You have not posted any ads yet.
            </p>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-20 overflow-hidden rounded-xl bg-slate-100">
                    {listing.images[0] ? (
                      <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">No image</div>
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-slate-900">{listing.title}</div>
                    <div className="text-sm text-slate-500">{formatPrice(listing.price)}</div>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  {listing.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}