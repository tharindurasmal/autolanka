"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { deleteUploadedFiles } from "@/lib/uploadthing-server";
import { uniqueSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function approveListing(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: "ACTIVE",
      moderationNote: null,
      publishedAt: listing.publishedAt ?? new Date(),
      expiresAt: listing.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
}

export async function rejectListing(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "REJECTED", publishedAt: null, expiresAt: null },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
}

export async function disableListing(listingId: string, formData: FormData) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  const note = String(formData.get("note") ?? "").trim();

  if (!note) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "DRAFT", moderationNote: note, publishedAt: null, expiresAt: null },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
  revalidatePath(`/dashboard/ads/${listingId}/edit`);
}

export async function reactivateListing(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: "ACTIVE",
      moderationNote: null,
      publishedAt: listing.publishedAt ?? new Date(),
      expiresAt: listing.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
  revalidatePath(`/dashboard/ads/${listingId}/edit`);
}

export async function deleteListingAdmin(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true },
  });

  if (!listing) return;

  if (listing.images.length) {
    await deleteUploadedFiles(listing.images.map((image) => image.key));
  }

  await prisma.listing.delete({ where: { id: listingId } });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
}

export async function toggleUserBan(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") return;

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !user.isBanned },
  });

  revalidatePath("/admin/listings");
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") return;

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/listings");
}

export async function createBrand(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();

  if (!name || !type) return;

  const slug = uniqueSlug(name);

  await prisma.brand.create({
    data: {
      name,
      slug,
      type: type as any,
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/sell");
  revalidatePath("/vehicles");
}

export async function createModel(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const brandId = String(formData.get("brandId") ?? "").trim();

  if (!name || !brandId) return;

  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) return;

  await prisma.model.create({
    data: {
      name,
      slug: uniqueSlug(name),
      brandId,
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/sell");
  revalidatePath("/vehicles");
}