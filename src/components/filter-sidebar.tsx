"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { VEHICLE_TYPES } from "@/lib/constants";
import type { Brand, District } from "@prisma/client";

export function FilterSidebar({
  brands,
  districts,
}: {
  brands: Brand[];
  districts: District[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // any filter change resets to page 1
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-6 rounded-xl border bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          defaultValue={searchParams.get("type") ?? ""}
          onChange={(e) => updateFilter("type", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Brand</label>
        <select
          defaultValue={searchParams.get("brand") ?? ""}
          onChange={(e) => updateFilter("brand", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">District</label>
        <select
          defaultValue={searchParams.get("district") ?? ""}
          onChange={(e) => updateFilter("district", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Price range (Rs.)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
          />
        </div>
      </div>
    </aside>
  );
}