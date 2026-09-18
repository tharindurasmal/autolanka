"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Car, ChevronDown, Fuel, MapPin, Settings2, Tags, Wallet, X } from "lucide-react";
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES } from "@/lib/constants";
import type { Brand, District } from "@prisma/client";

function formatRs(value: string) {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return value;
  return new Intl.NumberFormat("en-LK").format(n);
}

// A native <select> styled to match the rest of the panel, with a leading
// icon and a custom chevron (native select arrows can't be restyled directly).
function FilterSelect({
  icon: Icon,
  label,
  value,
  onChange,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" strokeWidth={2} />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

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

  // Keep local inputs in sync whenever the URL changes from elsewhere
  // (Reset button, a chip's X, browser back/forward, etc.)
  useEffect(() => {
    setMinPriceInput(searchParams.get("minPrice") ?? "");
    setMaxPriceInput(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  function pushParams(params: URLSearchParams) {
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    pushParams(params);
  }

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === "minPrice") params.delete("minPrice");
    if (key === "maxPrice") params.delete("maxPrice");
    pushParams(params);
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

    pushParams(params);
  }

  // Build a readable label for each active filter, for the chip row.
  const activeChips: { key: string; label: string }[] = [];
  const typeVal = searchParams.get("type");
  if (typeVal) {
    activeChips.push({ key: "type", label: VEHICLE_TYPES.find((t) => t.value === typeVal)?.label ?? typeVal });
  }
  const brandVal = searchParams.get("brand");
  if (brandVal) {
    activeChips.push({ key: "brand", label: brands.find((b) => b.slug === brandVal)?.name ?? brandVal });
  }
  const districtVal = searchParams.get("district");
  if (districtVal) {
    activeChips.push({ key: "district", label: districts.find((d) => d.slug === districtVal)?.name ?? districtVal });
  }
  const fuelVal = searchParams.get("fuel");
  if (fuelVal) {
    activeChips.push({ key: "fuel", label: FUEL_TYPES.find((f) => f.value === fuelVal)?.label ?? fuelVal });
  }
  const transmissionVal = searchParams.get("transmission");
  if (transmissionVal) {
    activeChips.push({
      key: "transmission",
      label: TRANSMISSIONS.find((t) => t.value === transmissionVal)?.label ?? transmissionVal,
    });
  }
  const minPriceVal = searchParams.get("minPrice");
  const maxPriceVal = searchParams.get("maxPrice");
  if (minPriceVal || maxPriceVal) {
    const from = minPriceVal ? `Rs. ${formatRs(minPriceVal)}` : "Rs. 0";
    const to = maxPriceVal ? `Rs. ${formatRs(maxPriceVal)}` : "Any";
    activeChips.push({ key: "minPrice", label: `${from} – ${to}` });
  }

  const activeCount = activeChips.length;

  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-xs font-medium text-sky-600 hover:text-sky-700"
          >
            Reset all
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-slate-100 pb-4">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeFilter(chip.key)}
              className="group flex items-center gap-1 rounded-full bg-sky-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100"
            >
              {chip.label}
              <X className="h-3 w-3 text-sky-500 transition group-hover:text-sky-700" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-5">
        <FilterSelect icon={Car} label="Vehicle type" value={typeVal ?? ""} onChange={(v) => updateFilter("type", v)}>
          <option value="">All types</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={Tags} label="Brand" value={brandVal ?? ""} onChange={(v) => updateFilter("brand", v)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={MapPin} label="District" value={districtVal ?? ""} onChange={(v) => updateFilter("district", v)}>
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={Fuel} label="Fuel type" value={fuelVal ?? ""} onChange={(v) => updateFilter("fuel", v)}>
          <option value="">All fuel types</option>
          {FUEL_TYPES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          icon={Settings2}
          label="Transmission"
          value={transmissionVal ?? ""}
          onChange={(v) => updateFilter("transmission", v)}
        >
          <option value="">Any transmission</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </FilterSelect>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Wallet className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Price range
          </label>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">
                  Min
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-2 text-sm outline-none transition focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">
                  Max
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    placeholder="5,000,000"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-2 text-sm outline-none transition focus:border-sky-400"
                  />
                </div>
              </div>
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