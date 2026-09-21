"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Car,
  ChevronDown,
  Filter,
  Fuel,
  MapPin,
  Menu,
  Settings2,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES } from "@/lib/constants";
import type { Brand, District } from "@prisma/client";

function formatRs(value: string) {
  const amount = Number(value);
  if (!value || Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("en-LK").format(amount);
}

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
  modelSuggestions = [],
}: {
  brands: Brand[];
  districts: District[];
  modelSuggestions?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();

  const [open, setOpen] = useState(false);
  const [modelInput, setModelInput] = useState(searchParams.get("model") ?? "");
  const [typeInput, setTypeInput] = useState(searchParams.get("type") ?? "");
  const [brandInput, setBrandInput] = useState(searchParams.get("brand") ?? "");
  const [districtInput, setDistrictInput] = useState(searchParams.get("district") ?? "");
  const [fuelInput, setFuelInput] = useState(searchParams.get("fuel") ?? "");
  const [transmissionInput, setTransmissionInput] = useState(searchParams.get("transmission") ?? "");
  const [minYearInput, setMinYearInput] = useState(searchParams.get("minYear") ?? "");
  const [maxYearInput, setMaxYearInput] = useState(searchParams.get("maxYear") ?? "");
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") ?? "");

  useEffect(() => {
    setModelInput(searchParams.get("model") ?? "");
    setTypeInput(searchParams.get("type") ?? "");
    setBrandInput(searchParams.get("brand") ?? "");
    setDistrictInput(searchParams.get("district") ?? "");
    setFuelInput(searchParams.get("fuel") ?? "");
    setTransmissionInput(searchParams.get("transmission") ?? "");
    setMinYearInput(searchParams.get("minYear") ?? "");
    setMaxYearInput(searchParams.get("maxYear") ?? "");
    setMinPriceInput(searchParams.get("minPrice") ?? "");
    setMaxPriceInput(searchParams.get("maxPrice") ?? "");
  }, [currentSearch, searchParams]);

  function pushParams(params: URLSearchParams) {
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (modelInput.trim()) params.set("model", modelInput.trim());
    if (typeInput) params.set("type", typeInput);
    if (brandInput) params.set("brand", brandInput);
    if (districtInput) params.set("district", districtInput);
    if (fuelInput) params.set("fuel", fuelInput);
    if (transmissionInput) params.set("transmission", transmissionInput);
    if (minYearInput) params.set("minYear", minYearInput);
    if (maxYearInput) params.set("maxYear", maxYearInput);
    if (minPriceInput && Number(minPriceInput) > 0) params.set("minPrice", minPriceInput);
    if (maxPriceInput && Number(maxPriceInput) > 0) params.set("maxPrice", maxPriceInput);

    pushParams(params);
  }

  function resetFilters() {
    setModelInput("");
    setTypeInput("");
    setBrandInput("");
    setDistrictInput("");
    setFuelInput("");
    setTransmissionInput("");
    setMinYearInput("");
    setMaxYearInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname);
  }

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === "minPrice") params.delete("minPrice");
    if (key === "maxPrice") params.delete("maxPrice");
    pushParams(params);
  }

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];

    const modelVal = searchParams.get("model");
    if (modelVal) chips.push({ key: "model", label: `Model: ${modelVal}` });

    const typeVal = searchParams.get("type");
    if (typeVal) chips.push({ key: "type", label: VEHICLE_TYPES.find((t) => t.value === typeVal)?.label ?? typeVal });

    const brandVal = searchParams.get("brand");
    if (brandVal) chips.push({ key: "brand", label: brands.find((b) => b.slug === brandVal)?.name ?? brandVal });

    const districtVal = searchParams.get("district");
    if (districtVal) chips.push({ key: "district", label: districts.find((d) => d.slug === districtVal)?.name ?? districtVal });

    const fuelVal = searchParams.get("fuel");
    if (fuelVal) chips.push({ key: "fuel", label: FUEL_TYPES.find((f) => f.value === fuelVal)?.label ?? fuelVal });

    const transmissionVal = searchParams.get("transmission");
    if (transmissionVal) {
      chips.push({
        key: "transmission",
        label: TRANSMISSIONS.find((t) => t.value === transmissionVal)?.label ?? transmissionVal,
      });
    }

    const minYearVal = searchParams.get("minYear");
    const maxYearVal = searchParams.get("maxYear");
    if (minYearVal || maxYearVal) {
      chips.push({ key: "minYear", label: `${minYearVal ?? "Any"} – ${maxYearVal ?? "Any"} year` });
    }

    const minPriceVal = searchParams.get("minPrice");
    const maxPriceVal = searchParams.get("maxPrice");
    if (minPriceVal || maxPriceVal) {
      const from = minPriceVal ? `Rs. ${formatRs(minPriceVal)}` : "Rs. 0";
      const to = maxPriceVal ? `Rs. ${formatRs(maxPriceVal)}` : "Any";
      chips.push({ key: "minPrice", label: `${from} – ${to}` });
    }

    return chips;
  }, [brands, districts, searchParams]);

  const activeCount = activeChips.length;

  const modelListId = "model-suggestions";

  const panel = (
    <>
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Find the best vehicle for you</h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Search by model, brand, location, fuel or budget</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="sm:col-span-2 xl:col-span-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Car className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Model
          </label>
          <input
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            list={modelListId}
            placeholder="Civic, Corolla, AE90..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400"
          />
          <datalist id={modelListId}>
            {Array.from(new Set(modelSuggestions)).map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </div>

        <FilterSelect icon={Car} label="Type" value={typeInput} onChange={setTypeInput}>
          <option value="">All types</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={Tags} label="Brand" value={brandInput} onChange={setBrandInput}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={MapPin} label="District" value={districtInput} onChange={setDistrictInput}>
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={Fuel} label="Fuel" value={fuelInput} onChange={setFuelInput}>
          <option value="">All fuel types</option>
          {FUEL_TYPES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect icon={Settings2} label="Transmission" value={transmissionInput} onChange={setTransmissionInput}>
          <option value="">Any transmission</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Wallet className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Price range
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <input
              type="number"
              min={0}
              step={50000}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="Min"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400"
            />
            <input
              type="number"
              min={0}
              step={50000}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="Max"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Settings2 className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Year range
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <input
              type="number"
              value={minYearInput}
              onChange={(e) => setMinYearInput(e.target.value)}
              placeholder="From"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400"
            />
            <input
              type="number"
              value={maxYearInput}
              onChange={(e) => setMaxYearInput(e.target.value)}
              placeholder="To"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400"
            />
          </div>
        </div>

        <div className="flex items-end gap-2 lg:col-span-2">
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Apply filters
          </button>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
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
    </>
  );

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Reset all
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-4 w-4" />
            {open ? "Hide filters" : "Show filters"}
          </button>
        </div>
      </div>

      <div className={`${open ? "block" : "hidden"} lg:block`}>{panel}</div>
    </section>
  );
}
