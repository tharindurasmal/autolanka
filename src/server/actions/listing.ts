"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listingSchema } from "@/lib/validations/listing";
import { slugify, uniqueSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createListing(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser(); // redirects to /login if not signed in

  const raw = Object.fromEntries(formData);

  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    return { success: false, message: "Something went wrong with your photos. Try re-uploading." };
  }

  const parsed = listingSchema.safeParse({
    ...raw,
    negotiable: formData.get("negotiable") === "on",
    images,
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const [brand, model] = await Promise.all([
    prisma.brand.findUnique({ where: { id: data.brandId } }),
    data.modelId ? prisma.model.findUnique({ where: { id: data.modelId } }) : null,
  ]);

  if (!brand) {
    return { success: false, message: "Selected brand no longer exists." };
  }

  const titleParts = [brand.name, model?.name, String(data.year), data.trim].filter(Boolean);
  const title = titleParts.join(" ");
  const slug = uniqueSlug(title);

  const listing = await prisma.listing.create({
    data: {
      slug,
      title,
      description: data.description,
      vehicleType: data.vehicleType as never,
      condition: data.condition as never,
      brandId: data.brandId,
      modelId: data.modelId || null,
      trim: data.trim || null,
      year: data.year,
      mileage: data.mileage ?? null,
      fuelType: data.fuelType as never,
      transmission: data.transmission as never,
      engineCc: data.engineCc ?? null,
      exteriorColor: data.exteriorColor || null,
      price: data.price,
      negotiable: data.negotiable,
      districtId: data.districtId,
      city: data.city,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      userId: user.id,
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          key: img.key,
          order: i,
        })),
      },
    },
  });

  revalidatePath("/vehicles");
  redirect(`/vehicles/${listing.slug}`);
}