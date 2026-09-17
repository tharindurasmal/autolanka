import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  approveListing,
  deleteListingAdmin,
  deleteUser,
  disableListing,
  reactivateListing,
  rejectListing,
  toggleUserBan,
} from "@/server/actions/moderation";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  DRAFT: "Disabled",
  REJECTED: "Rejected",
  SOLD: "Sold",
  EXPIRED: "Expired",
};

export default async function AdminModerationPage() {
  await requireAdmin();

  const [pending, active, disabled, rejected, users] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PENDING" },
      include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.listing.findMany({
      where: { status: "DRAFT" },
      include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.listing.findMany({
      where: { status: "REJECTED" },
      include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        listings: {
          select: { id: true, status: true },
        },
      },
    }),
  ]);

  const toneStyles: Record<string, string> = {
    neutral: "border-slate-200 bg-white",
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-rose-200 bg-rose-50",
  };

  const listingCards = (
    listings: typeof pending,
    title: string,
    tone: "neutral" | "success" | "warning" | "danger",
  ) => (
    <section className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {listings.length}
        </span>
      </div>

      <div className="space-y-3">
        {listings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No listings in this status.
          </p>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center"
            >
              <div className="relative h-20 w-24 overflow-hidden rounded-lg bg-slate-100">
                {listing.images[0] && (
                  <Image src={listing.images[0].url} alt={listing.title} fill className="object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/vehicles/${listing.slug}`} className="block truncate text-base font-semibold text-slate-800 hover:text-sky-700">
                  {listing.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {formatPrice(listing.price)} · {listing.user.name} ({listing.user.email})
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {statusLabel[listing.status]}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {listing.status === "PENDING" && (
                  <>
                    <form action={approveListing.bind(null, listing.id)}>
                      <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700">
                        Approve
                      </button>
                    </form>
                    <form action={rejectListing.bind(null, listing.id)}>
                      <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700">
                        Reject
                      </button>
                    </form>
                  </>
                )}

                {listing.status === "ACTIVE" && (
                  <>
                    <form action={disableListing.bind(null, listing.id)}>
                      <button className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600">
                        Disable
                      </button>
                    </form>
                    <form action={deleteListingAdmin.bind(null, listing.id)}>
                      <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100">
                        Delete
                      </button>
                    </form>
                  </>
                )}

                {listing.status === "DRAFT" && (
                  <>
                    <form action={reactivateListing.bind(null, listing.id)}>
                      <button className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700">
                        Activate
                      </button>
                    </form>
                    <form action={deleteListingAdmin.bind(null, listing.id)}>
                      <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100">
                        Delete
                      </button>
                    </form>
                  </>
                )}

                {listing.status === "REJECTED" && (
                  <form action={approveListing.bind(null, listing.id)}>
                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700">
                      Approve
                    </button>
                  </form>
                )}

                {listing.status === "SOLD" && (
                  <form action={deleteListingAdmin.bind(null, listing.id)}>
                    <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100">
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="rounded-2xl border border-sky-200 bg-linear-to-r from-sky-700 to-sky-900 p-6 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Admin dashboard</p>
        <h1 className="mt-2 text-3xl font-bold">Vehicle listings & users</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[{ label: "Pending", value: pending.length }, { label: "Active", value: active.length }, { label: "Disabled", value: disabled.length }, { label: "Users", value: users.length }].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {listingCards(pending, "Pending review", "warning")}
        {listingCards(active, "Live ads", "success")}
        {listingCards(disabled, "Disabled ads", "neutral")}
        {listingCards(rejected, "Rejected ads", "danger")}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Users</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {users.length}
          </span>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{user.name || "Unnamed user"}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {user.role} · {user.listings.length} listings · {user.isBanned ? "Banned" : "Active"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <form action={toggleUserBan.bind(null, user.id)}>
                  <button className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition ${user.isBanned ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"}`}>
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>
                </form>
                <form action={deleteUser.bind(null, user.id)}>
                  <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100">
                    Delete user
                  </button>
                </form>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No users found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}