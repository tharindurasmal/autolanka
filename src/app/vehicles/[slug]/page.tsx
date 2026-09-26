import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Gallery } from "@/components/gallery";
import { FavouriteButton } from "@/components/favourite-button";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import { formatDistanceToNow, format } from "date-fns";
import { Phone, MessageCircle } from "lucide-react";

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
      city: true, // Included relational City model
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

  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in your ad "${listing.title}" listed for Rs. ${formatPrice(listing.price).replace(/LKR/g, "").trim()} on BuyCarLK. Is this still available? Link: ${process.env.NEXT_PUBLIC_SITE_URL || "https://buycarlk.app"}/vehicles/${listing.slug}`
  );

  return (
    <div className="bg-slate-100 min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-5 lg:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Multi-line wrapping breadcrumb matching the requested layout */}
        <nav className="mb-3 sm:mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500 sm:text-sm">
          <Link href="/vehicles" className="transition hover:text-sky-600">
            All Ads
          </Link>
          <span className="text-slate-300">›</span>
          <Link href={`/vehicles?district=${listing.district.slug}`} className="transition hover:text-sky-600">
            {listing.district.name}
          </Link>
          {listing.city && (
            <>
              <span className="text-slate-300">›</span>
              <Link href={`/vehicles?district=${listing.district.slug}&city=${listing.city.slug}`} className="transition hover:text-sky-600">
                {listing.city.name}
              </Link>
            </>
          )}
          <span className="text-slate-300">›</span>
          <Link href="/vehicles" className="transition hover:text-sky-600">
            Vehicle
          </Link>
          <span className="text-slate-300">›</span>
          <Link href={`/vehicles?type=${listing.vehicleType}`} className="transition hover:text-sky-600">
            {listing.vehicleType}
          </Link>
          <span className="text-slate-300">›</span>
          <Link href={`/vehicles?brand=${listing.brand.slug}`} className="transition hover:text-sky-600">
            {listing.brand.name}
          </Link>
          {listing.model && (
            <>
              <span className="text-slate-300">›</span>
              <Link href={`/vehicles?brand=${listing.brand.slug}&model=${encodeURIComponent(listing.model.name)}`} className="transition hover:text-sky-600">
                {listing.model.name}
              </Link>
            </>
          )}
          <span className="text-slate-300">›</span>
          <span className="font-semibold text-slate-800 break-words">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[1.65fr_0.85fr]">
          <div className="space-y-4 sm:space-y-5 min-w-0">
            {/* Gallery with Single Central Watermark */}
            <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[26px]">
              <Gallery images={listing.images} title={listing.title} />
              
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <span className="rotate-[-25deg] select-none text-2xl sm:text-5xl font-black tracking-widest text-white/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  BuyCarLK
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[26px] sm:p-5 overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                <div className="w-full sm:w-auto sm:flex-1 min-w-0">
                  <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-3xl break-words">
                    {listing.title}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 sm:mt-2 sm:gap-2 sm:text-sm">
                    <span>{listing.contactName}</span>
                    <span>•</span>
                    <span>{listing.publishedAt ? formatDistanceToNow(listing.publishedAt, { addSuffix: true }) : "Recently published"}</span>
                    <span>•</span>
                    <span>{listing.city?.name}, {listing.district.name}</span>
                  </div>
                </div>

                <FavouriteButton listingId={listing.id} signedIn={!!session?.user} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3">
                <div className="text-2xl font-black leading-none text-sky-700 sm:text-4xl">
                  Rs. {formatPrice(listing.price).replace(/LKR/g, "").trim()}
                </div>
                {listing.negotiable && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-700 sm:px-3 sm:py-1 sm:text-[10px]">
                    Negotiable
                  </span>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-white overflow-hidden sm:mt-6">
                <dl className="divide-y divide-slate-200">
                  <Spec label="Location" value={listing.city?.name ?? "—"} />
                  <Spec label="Year" value={String(listing.year)} />
                  <Spec
                    label="Mileage"
                    value={listing.mileage ? `${listing.mileage.toLocaleString()} km` : "—"}
                  />
                  <Spec label="Make" value={listing.brand.name} />
                  <Spec label="Model" value={listing.model?.name ?? "—"} />
                  <Spec label="Gear" value={listing.transmission} />
                  <Spec label="Fuel Type" value={listing.fuelType} />
                  <Spec
                    label="Engine (cc)"
                    value={listing.engineCc ? String(listing.engineCc) : "—"}
                  />
                  <Spec
                    label="Condition"
                    value={listing.condition.replace(/_/g, " ")}
                  />
                  <Spec
                    label="Ad Date"
                    value={
                      listing.publishedAt
                        ? format(new Date(listing.publishedAt), "yyyy MMM dd, h:mm a").replace("AM", "am").replace("PM", "pm")
                        : "Recently published"
                    }
                  />
                </dl>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4 sm:mt-6 sm:pt-5 overflow-hidden">
                <h2 className="mb-2 text-base font-bold text-slate-900 sm:text-lg">Description</h2>
                <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-[15px] sm:leading-7 break-words">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          <aside className="h-fit xl:sticky xl:top-6 min-w-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[26px] sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">
                Seller contact
              </p>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 sm:mt-4 sm:rounded-2xl sm:p-4">
                <p className="text-sm font-bold text-slate-900 sm:text-lg break-words">{listing.contactName}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 sm:text-sm">Private seller</p>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600 sm:mt-5 sm:space-y-3 sm:text-sm">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:py-2.5">
                  <span>Location</span>
                  <span className="font-semibold text-slate-900 truncate">{listing.city?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:py-2.5">
                  <span>District</span>
                  <span className="font-semibold text-slate-900 truncate">{listing.district.name}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-center text-xs font-semibold text-white shadow-[0_10px_20px_rgba(14,116,144,0.25)] transition hover:bg-sky-700 sm:rounded-2xl sm:py-3 sm:text-base"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="truncate">Call {listing.contactPhone}</span>
                </a>
                <a
                  href={`https://wa.me/94${listing.contactPhone.replace(/\D/g, "").slice(1)}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-center text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:rounded-2xl sm:py-3 sm:text-base"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                  <span>WhatsApp now</span>
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
    <div className="flex px-3 py-2.5 transition-colors duration-150 hover:bg-slate-50 sm:px-5 sm:py-3.5">
      <dt className="w-[110px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:w-[180px] sm:text-xs">
        {label}
      </dt>
      <dd className="text-xs font-medium text-slate-800 sm:text-[14px] break-words">{value}</dd>
    </div>
  );
}