"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Fuel,
  Settings2,
  Tags,
  Wallet,
  X,
  Search,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES } from "@/lib/constants";
import type { Brand, District } from "@prisma/client";

function formatRs(value: string) {
  const amount = Number(value);
  if (!value || Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("en-LK").format(amount);
}

function QuickFilterPopup({
  value,
  onChange,
  options,
  placeholder,
  alignRight = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  alignRight?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex max-w-[105px] items-center justify-between gap-1.5 rounded-full border border-slate-300 bg-white py-1.5 pl-3 pr-2 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-sky-500 sm:max-w-[140px] sm:py-2 sm:pl-4 sm:pr-2.5 sm:text-sm"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500 sm:h-4 sm:w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg sm:w-56 ${
              alignRight ? "right-0" : "left-0"
            }`}
          >
            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  !value ? "bg-sky-50 font-semibold text-sky-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {placeholder}
              </button>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    value === opt.value
                      ? "bg-sky-50 font-semibold text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
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
          className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
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
  
  const [sortInput, setSortInput] = useState(searchParams.get("sort") ?? "");

  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
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
    setSortInput(searchParams.get("sort") ?? "");
  }

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
    if (sortInput) params.set("sort", sortInput);

    pushParams(params);
  }

  function handleQuickFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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
    setSortInput("");
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

    const brandVal = searchParams.get("brand");
    if (brandVal) chips.push({ key: "brand", label: brands.find((b) => b.slug === brandVal)?.name ?? brandVal });

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
  }, [brands, searchParams]);

  const activeCount = activeChips.length;

  const advancedPanel = (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:mt-6 sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Advanced Vehicle Filters</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelect icon={Tags} label="Brand" value={brandInput} onChange={setBrandInput}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
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
        <div className="lg:col-span-3 xl:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Wallet className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Price range
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
            <input
              type="number"
              min={0}
              step={50000}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="Min"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
            />
            <input
              type="number"
              min={0}
              step={50000}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="Max"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Settings2 className="h-4 w-4 text-slate-400" strokeWidth={2} />
            Year range
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
            <input
              type="number"
              value={minYearInput}
              onChange={(e) => setMinYearInput(e.target.value)}
              placeholder="From"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
            />
            <input
              type="number"
              value={maxYearInput}
              onChange={(e) => setMaxYearInput(e.target.value)}
              placeholder="To"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-end gap-2 lg:col-span-6 xl:col-span-2">
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
    </div>
  );

  return (
    <section className="w-full border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-snug text-slate-900 sm:text-2xl">
              Buy and Sell vehicles
            </h1>
            <div className="mt-1 hidden items-center gap-1.5 text-sm text-slate-500 md:flex">
              <span>Home</span>
              <span className="text-slate-300">›</span>
              <span className="font-semibold text-slate-800">All Vehicles in Sri Lanka</span>
            </div>
          </div>

          <div className="relative w-full md:max-w-md">
            <input
              value={modelInput}
              onChange={(e) => {
                const val = e.target.value;
                setModelInput(val);
                if (val.trim() === "") {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("model");
                  pushParams(params);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search car, bike, or vehicle model..."
              className="w-full rounded-full border border-slate-300 py-2.5 pl-5 pr-[80px] text-sm outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 sm:py-3"
            />
            
            {modelInput && (
              <button
                type="button"
                onClick={() => {
                  setModelInput("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("model");
                  pushParams(params);
                }}
                className="absolute right-[52px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}

            <button
              onClick={applyFilters}
              className="absolute bottom-1 right-1 top-1 flex aspect-square items-center justify-center rounded-full bg-[#ffc800] text-slate-900 transition hover:bg-yellow-500 sm:bottom-1.5 sm:right-1.5 sm:top-1.5"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-6 sm:gap-2">
          
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle filters"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-[38px] sm:w-[38px] ${
              open || activeCount > 0
                ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                : "border-sky-600 bg-sky-50 text-sky-600 hover:bg-sky-100"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
          </button>

          <QuickFilterPopup
            value={districtInput}
            onChange={(val) => {
              setDistrictInput(val);
              handleQuickFilterChange("district", val);
            }}
            options={districts.map((d) => ({ value: d.slug, label: d.name }))}
            placeholder="Sri Lanka"
          />

          <QuickFilterPopup
            value={typeInput}
            onChange={(val) => {
              setTypeInput(val);
              handleQuickFilterChange("type", val);
            }}
            options={VEHICLE_TYPES}
            placeholder="Category"
          />

          <QuickFilterPopup
            value={sortInput}
            onChange={(val) => {
              setSortInput(val);
              handleQuickFilterChange("sort", val);
            }}
            options={[
              { value: "newest", label: "Newest" },
              { value: "price_asc", label: "Price: Low to High" },
              { value: "price_desc", label: "Price: High to Low" },
            ]}
            placeholder="Sort"
            alignRight
          />

          {/* Quick Reset Button */}
          {(activeCount > 0 || modelInput || typeInput || districtInput || sortInput) && (
            <button
              type="button"
              onClick={resetFilters}
              title="Reset Filters"
              className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:py-2 sm:text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {activeCount > 0 && !open && (
          <div className="mt-4 flex flex-wrap gap-1.5">
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

        <div className={`transition-all duration-300 ease-in-out ${open ? "block opacity-100" : "hidden opacity-0"}`}>
          {advancedPanel}
        </div>

      </div>
    </section>
  );
}