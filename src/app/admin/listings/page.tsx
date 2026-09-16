import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { approveListing, rejectListing } from "@/server/actions/moderation";

export default async function AdminModerationPage() {
  await requireAdmin();

  const pending = await prisma.listing.findMany({
    where: { status: "PENDING" },
    include: { images: { take: 1 }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Pending ads ({pending.length})</h1>

      <div className="space-y-3">
        {pending.map((l) => (
          <div key={l.id} className="flex items-center gap-4 rounded-xl border bg-white p-3">
            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {l.images[0] && <Image src={l.images[0].url} alt={l.title} fill className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{l.title}</p>
              <p className="text-sm text-gray-500">
                {formatPrice(l.price)} · {l.user.name} ({l.user.email})
              </p>
            </div>
            <form action={approveListing.bind(null, l.id)}>
              <button className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white">
                Approve
              </button>
            </form>
            <form action={rejectListing.bind(null, l.id)}>
              <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white">
                Reject
              </button>
            </form>
          </div>
        ))}

        {pending.length === 0 && (
          <p className="rounded-lg border border-dashed p-12 text-center text-gray-500">
            Nothing waiting for review.
          </p>
        )}
      </div>
    </div>
  );
}