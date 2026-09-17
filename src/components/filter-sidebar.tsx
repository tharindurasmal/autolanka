"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES } from "@/lib/constants";
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

  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") ?? "");


  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());

    if (minPriceInput && Number(minPriceInput) > 0) {
      params.set("minPrice", minPriceInput);
    } else {
      params.delete("minPrice");
    }

    if (maxPriceInput && Number(maxPriceInput) > 0) {
      params.set("maxPrice", maxPriceInput);
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-xs font-medium text-sky-600 hover:text-sky-700"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Vehicle type
          </label>
          <select
            defaultValue={searchParams.get("type") ?? ""}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Brand
          </label>
          <select
            defaultValue={searchParams.get("brand") ?? ""}
            onChange={(e) => updateFilter("brand", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            District
          </label>
          <select
            defaultValue={searchParams.get("district") ?? ""}
            onChange={(e) => updateFilter("district", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Fuel type
          </label>
          <select
            defaultValue={searchParams.get("fuel") ?? ""}
            onChange={(e) => updateFilter("fuel", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All fuel types</option>
            {FUEL_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Transmission
          </label>
          <select
            defaultValue={searchParams.get("transmission") ?? ""}
            onChange={(e) => updateFilter("transmission", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Any transmission</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Price range
          </label>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Min price
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sky-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Max price
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                placeholder="5000000"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-sky-400"
              />
            </div>

            <button
              type="button"
              onClick={applyPriceRange}
              className="w-full rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Apply price
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}