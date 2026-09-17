import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Gallery } from "@/components/gallery";
import { FavouriteButton } from "@/components/favourite-button";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getListing(slug: string) {
  return prisma.listing.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      brand: true,
      model: true,
      district: true,
      user: { select: { name: true, createdAt: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Ad not found" };

  return {
    title: `${listing.title} - ${formatPrice(listing.price)}`,
    description: listing.description.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 155),
      images: listing.images[0] ? [listing.images[0].url] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const session = await getSession();

  prisma.listing
    .update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: listing.title,
    image: listing.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "LKR",
      availability: "https://schema.org/InStock",
    },
    vehicleModelDate: String(listing.year),
    mileageFromOdometer: listing.mileage
      ? { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" }
      : undefined,
  };

  return (
    <div className="bg-slate-100">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-sky-100 px-2.5 py-1 font-semibold text-sky-700">
            {listing.vehicleType}
          </span>
          <span>•</span>
          <span>{listing.brand.name}</span>
          <span>•</span>
          <span>{listing.model?.name ?? "Model not listed"}</span>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_0.85fr]">
          <div className="space-y-5">
            <Gallery images={listing.images} title={listing.title} />

            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {listing.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
                    <span>{listing.city}</span>
                    <span>•</span>
                    <span>{listing.district.name}</span>
                    <span>•</span>
                    <span>
                      {listing.publishedAt
                        ? `${formatDistanceToNow(listing.publishedAt, { addSuffix: true })}`
                        : "Recently published"}
                    </span>
                  </div>
                </div>

                <FavouriteButton listingId={listing.id} signedIn={!!session?.user} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="text-3xl font-black leading-none text-sky-700 sm:text-4xl">
                  {formatPrice(listing.price)}
                </div>
                {listing.negotiable && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Negotiable
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Spec label="Year" value={String(listing.year)} />
                <Spec label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} km` : "—"} />
                <Spec label="Fuel" value={listing.fuelType} />
                <Spec label="Transmission" value={listing.transmission} />
                <Spec label="Condition" value={listing.condition.replace(/_/g, " ")} />
                <Spec label="Engine" value={listing.engineCc ? `${listing.engineCc} cc` : "—"} />
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h2 className="mb-2 text-lg font-bold text-slate-900">Description</h2>
                <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          <aside className="h-fit xl:sticky xl:top-6">
            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Seller contact
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-lg font-bold text-slate-900">{listing.contactName}</p>
                <p className="mt-1 text-sm text-slate-500">Private seller</p>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span>Location</span>
                  <span className="font-semibold text-slate-900">{listing.city}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span>District</span>
                  <span className="font-semibold text-slate-900">{listing.district.name}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="block rounded-2xl bg-sky-600 py-3 text-center text-base font-semibold text-white shadow-[0_10px_20px_rgba(14,116,144,0.25)] transition hover:bg-sky-700"
                >
                  Call {listing.contactPhone}
                </a>
                <a
                  href={`https://wa.me/94${listing.contactPhone.replace(/\D/g, "").slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-center text-base font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  WhatsApp now
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 text-base font-bold text-slate-900">{value}</dd>
    </div>
  );
}