"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { deleteUploadedFiles } from "@/lib/uploadthing-server";
import { revalidatePath } from "next/cache";

export async function approveListing(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: "ACTIVE",
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

export async function disableListing(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "DRAFT", publishedAt: null, expiresAt: null },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
}

export async function reactivateListing(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: "ACTIVE",
      publishedAt: listing.publishedAt ?? new Date(),
      expiresAt: listing.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard/ads");
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