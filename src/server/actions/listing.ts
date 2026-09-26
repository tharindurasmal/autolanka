"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listingSchema } from "@/lib/validations/listing";
import { uniqueSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteUploadedFiles } from "@/lib/uploadthing-server";
import { type Condition, type FuelType, type ListingStatus, type Transmission, type VehicleType } from "@prisma/client";

export type ActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function getListingPayload(formData: FormData) {
  const imagesInput = formData.get("images");
  let images: { url: string; key: string }[] = [];

  if (typeof imagesInput === "string" && imagesInput.trim()) {
    try {
      const parsed = JSON.parse(imagesInput);
      if (Array.isArray(parsed)) {
        images = parsed.filter(
          (image): image is { url: string; key: string } =>
            typeof image?.url === "string" && typeof image?.key === "string",
        );
      }
    } catch {
      // malformed payloads are handled by validation below
    }
  }

  return {
    vehicleType: formData.get("vehicleType"),
    condition: formData.get("condition"),
    brandId: formData.get("brandId"),
    modelId: formData.get("modelId"),
    trim: formData.get("trim"),
    year: formData.get("year"),
    mileage: formData.get("mileage"),
    fuelType: formData.get("fuelType"),
    transmission: formData.get("transmission"),
    engineCc: formData.get("engineCc"),
    exteriorColor: formData.get("exteriorColor"),
    price: formData.get("price"),
    negotiable: formData.get("negotiable") === "on" || formData.get("negotiable") === "true",
    districtId: formData.get("districtId"),
    cityId: formData.get("cityId"), // Updated from city to cityId
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    description: formData.get("description"),
    images,
  };
}

export async function createListing(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const payload = getListingPayload(formData);
  const parsed = listingSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of parsed.error.issues) {
      const key = (issue.path[0] ?? "form").toString();
      fieldErrors[key] ??= [];
      fieldErrors[key].push(issue.message);
    }

    return {
      success: false,
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const nextStatus = String(formData.get("nextStatus") ?? "ACTIVE") as ListingStatus;
  const [brand, model] = await Promise.all([
    prisma.brand.findUnique({ where: { id: data.brandId } }),
    data.modelId ? prisma.model.findUnique({ where: { id: data.modelId } }) : null,
  ]);

  if (!brand) {
    return {
      success: false,
      message: "The selected brand could not be found.",
      fieldErrors: { brandId: ["Select a valid brand"] },
    };
  }

  if (brand.type !== data.vehicleType) {
    return {
      success: false,
      message: "The selected brand does not match the vehicle type.",
      fieldErrors: { brandId: ["Select a brand for the chosen vehicle type"] },
    };
  }

  if (data.modelId && !model) {
    return {
      success: false,
      message: "The selected model is no longer available.",
      fieldErrors: { modelId: ["Select a valid model"] },
    };
  }

  const titleParts = [brand.name, model?.name, data.trim, String(data.year)];
  const title = titleParts.filter(Boolean).join(" ").trim() || `${brand.name} vehicle`;

  let slug = uniqueSlug(title);
  let suffix = 1;

  while (await prisma.listing.findUnique({ where: { slug } })) {
    slug = uniqueSlug(`${title}-${suffix}`);
    suffix += 1;
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      slug,
      description: data.description,
      vehicleType: data.vehicleType as VehicleType,
      condition: data.condition as Condition,
      brandId: data.brandId,
      modelId: data.modelId || null,
      trim: data.trim || null,
      year: data.year,
      mileage: data.mileage ?? null,
      fuelType: data.fuelType as FuelType,
      transmission: data.transmission as Transmission,
      engineCc: data.engineCc ?? null,
      exteriorColor: data.exteriorColor || null,
      price: data.price,
      negotiable: data.negotiable,
      districtId: data.districtId,
      cityId: data.cityId, // Updated from city to cityId
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      status: nextStatus === "PENDING" ? "PENDING" : "ACTIVE",
      publishedAt: nextStatus === "PENDING" ? null : new Date(),
      expiresAt: nextStatus === "PENDING" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: user.id,
    },
  });

  await prisma.listingImage.createMany({
    data: data.images.map((image, index) => ({
      listingId: listing.id,
      url: image.url,
      key: image.key,
      order: index,
    })),
  });

  revalidatePath("/dashboard/ads");
  revalidatePath("/vehicles");
  revalidatePath("/admin/listings");
  redirect("/dashboard/ads");
}

export async function updateListing(
  listingId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const existing = await prisma.listing.findFirst({
    where: { id: listingId, userId: user.id },
    include: { images: true },
  });

  if (!existing) {
    return {
      success: false,
      message: "This ad could not be found or is not yours to edit.",
    };
  }

  const payload = getListingPayload(formData);
  const parsed = listingSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of parsed.error.issues) {
      const key = (issue.path[0] ?? "form").toString();
      fieldErrors[key] ??= [];
      fieldErrors[key].push(issue.message);
    }

    return {
      success: false,
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const nextStatus = String(formData.get("nextStatus") ?? existing.status) as ListingStatus;
  const [brand, model] = await Promise.all([
    prisma.brand.findUnique({ where: { id: data.brandId } }),
    data.modelId ? prisma.model.findUnique({ where: { id: data.modelId } }) : null,
  ]);

  if (!brand) {
    return {
      success: false,
      message: "The selected brand could not be found.",
      fieldErrors: { brandId: ["Select a valid brand"] },
    };
  }

  if (brand.type !== data.vehicleType) {
    return {
      success: false,
      message: "The selected brand does not match the vehicle type.",
      fieldErrors: { brandId: ["Select a brand for the chosen vehicle type"] },
    };
  }

  if (data.modelId && !model) {
    return {
      success: false,
      message: "The selected model is no longer available.",
      fieldErrors: { modelId: ["Select a valid model"] },
    };
  }

  const titleParts = [brand.name, model?.name, data.trim, String(data.year)];
  const title = titleParts.filter(Boolean).join(" ").trim() || `${brand.name} vehicle`;

  const imagesToDelete = existing.images.map((image) => image.key).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.listingImage.deleteMany({ where: { listingId: existing.id } });

    await tx.listing.update({
      where: { id: existing.id },
      data: {
        title,
        description: data.description,
        vehicleType: data.vehicleType as VehicleType,
        condition: data.condition as Condition,
        brandId: data.brandId,
        modelId: data.modelId || null,
        trim: data.trim || null,
        year: data.year,
        mileage: data.mileage ?? null,
        fuelType: data.fuelType as FuelType,
        transmission: data.transmission as Transmission,
        engineCc: data.engineCc ?? null,
        exteriorColor: data.exteriorColor || null,
        price: data.price,
        negotiable: data.negotiable,
        districtId: data.districtId,
        cityId: data.cityId, // Updated from city to cityId
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        status: nextStatus,
        publishedAt: nextStatus === "PENDING" ? null : existing.publishedAt ?? new Date(),
        expiresAt: nextStatus === "PENDING" ? null : existing.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await tx.listingImage.createMany({
      data: data.images.map((image, index) => ({
        listingId: existing.id,
        url: image.url,
        key: image.key,
        order: index,
      })),
    });
  });

  if (imagesToDelete.length) {
    await deleteUploadedFiles(imagesToDelete);
  }

  revalidatePath("/dashboard/ads");
  revalidatePath("/vehicles");
  revalidatePath("/admin/listings");
  revalidatePath(`/vehicles/${existing.slug}`);
  redirect("/dashboard/ads");
}

export async function markAsSold(listingId: string) {
  const user = await requireUser();

  await prisma.listing.updateMany({
    where: { id: listingId, userId: user.id },
    data: { status: "SOLD" },
  });

  revalidatePath("/dashboard/ads");
}

export async function deleteListing(listingId: string) {
  const user = await requireUser();

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, userId: user.id },
    include: { images: true },
  });

  if (!listing) return;

  await deleteUploadedFiles(listing.images.map((i) => i.key));
  await prisma.listing.delete({ where: { id: listingId } });

  revalidatePath("/dashboard/ads");
}