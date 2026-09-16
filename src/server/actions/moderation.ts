"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function approveListing(listingId: string) {
  await requireAdmin();

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: "ACTIVE",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/vehicles");
}

export async function rejectListing(listingId: string) {
  await requireAdmin();
  await prisma.listing.update({ where: { id: listingId }, data: { status: "REJECTED" } });
  revalidatePath("/admin/listings");
}