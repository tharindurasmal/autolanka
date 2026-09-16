import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Gallery } from "@/components/gallery";
import { FavouriteButton } from "@/components/favourite-button";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";

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

  // Fire-and-forget view increment — don't block the page render on it.
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <FavouriteButton listingId={listing.id} signedIn={!!session?.user} />
          </div>
          <p className="mt-1 text-3xl font-bold text-blue-600">
            {formatPrice(listing.price)}
            {listing.negotiable && <span className="ml-2 text-sm font-normal text-gray-500">Negotiable</span>}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-white p-4 sm:grid-cols-3">
            <Spec label="Year" value={String(listing.year)} />
            <Spec label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} km` : "—"} />
            <Spec label="Fuel" value={listing.fuelType} />
            <Spec label="Transmission" value={listing.transmission} />
            <Spec label="Condition" value={listing.condition.replace("_", " ")} />
            <Spec label="Engine" value={listing.engineCc ? `${listing.engineCc} cc` : "—"} />
          </dl>

          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-line text-gray-700">{listing.description}</p>
          </div>
        </div>

        <aside className="h-fit rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Seller</p>
          <p className="font-medium">{listing.contactName}</p>
          <p className="mt-4 text-sm text-gray-500">Location</p>
          <p className="font-medium">{listing.city}, {listing.district.name}</p>

          <a
            href={`tel:${listing.contactPhone}`}
            className="mt-4 block rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white hover:bg-blue-700"
          >
            Call {listing.contactPhone}
          </a>
          <a
            href={`https://wa.me/94${listing.contactPhone.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg border py-2.5 text-center font-medium hover:bg-gray-50"
          >
            WhatsApp
          </a>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium capitalize">{value.toLowerCase()}</dd>
    </div>
  );
}