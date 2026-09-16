import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Sri Lankan rupees: 2450000 → "Rs. 2,450,000" */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** "Toyota Aqua 2015" → "toyota-aqua-2015" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Slugs must be unique — append a short random suffix. */
export function uniqueSlug(input: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugify(input)}-${suffix}`;
}