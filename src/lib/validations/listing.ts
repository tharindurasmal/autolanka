import { z } from "zod";
import { VehicleType, Condition, FuelType, Transmission } from "@prisma/client";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]];

const currentYear = new Date().getFullYear();

export const listingImageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
});

export const listingSchema = z.object({
  vehicleType: z.enum(enumValues(VehicleType)),
  condition: z.enum(enumValues(Condition)),
  brandId: z.string().min(1, "Choose a brand"),
  modelId: z.string().optional().or(z.literal("")),
  trim: z.string().max(60).optional().or(z.literal("")),

  year: z.coerce
    .number()
    .int()
    .min(1980, "Year looks too old")
    .max(currentYear + 1, "Year can't be in the future"),
  mileage: z.coerce.number().int().min(0).optional(),
  fuelType: z.enum(enumValues(FuelType)),
  transmission: z.enum(enumValues(Transmission)),
  engineCc: z.coerce.number().int().min(0).optional(),
  exteriorColor: z.string().max(40).optional().or(z.literal("")),

  price: z.coerce
    .number()
    .int("Price must be a whole number")
    .positive("Price must be greater than 0"),
  negotiable: z.coerce.boolean().default(true),

  districtId: z.string().min(1, "Choose a district"),
  city: z.string().min(2, "Enter a city or town"),
  contactName: z.string().min(2, "Enter a contact name"),
  contactPhone: z
    .string()
    .regex(/^0\d{9}$/, "Enter a valid 10-digit phone number starting with 0"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3000),

  images: z
    .array(listingImageSchema)
    .min(1, "Add at least one photo")
    .max(10, "Maximum 10 photos"),
});

export type ListingInput = z.infer<typeof listingSchema>;