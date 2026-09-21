"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createListing, type ActionState } from "@/server/actions/listing";
import { ImageUploader, type UploadedImage } from "@/components/image-uploader";
import {
  VEHICLE_TYPES,
  CONDITIONS,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/lib/constants";
import type { Brand, Model, District } from "@prisma/client";

type BrandWithModels = Brand & { models: Model[] };

interface Props {
  brands: BrandWithModels[];
  districts: District[];
}

const initialState: ActionState = { success: false };

export function ListingForm({ brands, districts }: Props) {
  const [state, formAction] = useActionState(createListing, initialState);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  const filteredBrands = selectedVehicleType
    ? brands.filter((brand) => brand.type === selectedVehicleType || brand.type === "OTHER")
    : brands;

  const models = filteredBrands.find((b) => b.id === selectedBrandId)?.models ?? [];

  function handleVehicleTypeChange(value: string) {
    setSelectedVehicleType(value);
    setSelectedBrandId("");
    setSelectedModelId("");
  }

  function handleBrandChange(value: string) {
    setSelectedBrandId(value);
    setSelectedModelId("");
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.message && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.message}</p>
      )}

      <Section title="Vehicle details">
        <Row>
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              name="vehicleType"
              required
              value={selectedVehicleType}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">Select type</option>
              {VEHICLE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.vehicleType} />
          </div>
          <Select name="condition" label="Condition" options={CONDITIONS} error={state.fieldErrors?.condition} />
        </Row>

        <Row>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand</label>
            <select
              name="brandId"
              required
              value={selectedBrandId}
              onChange={(e) => handleBrandChange(e.target.value)}
              disabled={!selectedVehicleType}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">{selectedVehicleType ? "Select brand" : "Select type first"}</option>
              {filteredBrands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.brandId} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Model</label>
            <select
              name="modelId"
              disabled={!selectedBrandId}
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white disabled:bg-slate-100"
            >
              <option value="">Select model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </Row>

        <Row>
          <Input name="trim" label="Trim / grade (optional)" placeholder="G Grade, Sport..." />
          <Input name="year" label="Year" type="number" required error={state.fieldErrors?.year} />
        </Row>
      </Section>

      <Section title="Specs">
        <Row>
          <Input name="mileage" label="Mileage (km)" type="number" />
          <Input name="engineCc" label="Engine (cc)" type="number" />
        </Row>
        <Row>
          <Select name="fuelType" label="Fuel type" options={FUEL_TYPES} error={state.fieldErrors?.fuelType} />
          <Select name="transmission" label="Transmission" options={TRANSMISSIONS} error={state.fieldErrors?.transmission} />
        </Row>
        <Input name="exteriorColor" label="Exterior colour (optional)" />
      </Section>

      <Section title="Price">
        <Row>
          <Input name="price" label="Price (Rs.)" type="number" required error={state.fieldErrors?.price} />
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input type="checkbox" name="negotiable" defaultChecked className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            Negotiable
          </label>
        </Row>
      </Section>

      <Section title="Location & contact">
        <Row>
          <div>
            <label className="mb-1 block text-sm font-medium">District</label>
            <select name="districtId" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white">
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.districtId} />
          </div>
          <Input name="city" label="City / town" required error={state.fieldErrors?.city} />
        </Row>
        <Row>
          <Input name="contactName" label="Contact name" required error={state.fieldErrors?.contactName} />
          <Input name="contactPhone" label="Phone" type="tel" placeholder="07XXXXXXXX" required error={state.fieldErrors?.contactPhone} />
        </Row>
      </Section>

      <Section title="Description">
        <textarea
          name="description"
          rows={6}
          required
          placeholder="Describe the vehicle's condition, service history, any modifications..."
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
        />
        <FieldError messages={state.fieldErrors?.description} />
      </Section>

      <Section title="Photos">
        <ImageUploader value={images} onChange={setImages} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <FieldError messages={state.fieldErrors?.images} />
      </Section>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Posting..." : "Post ad"}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Input({
  label,
  error,
  ...props
}: { label: string; error?: string[] } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input {...props} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <FieldError messages={error} />
    </div>
  );
}

function Select({
  label,
  options,
  error,
  name,
}: { label: string; name: string; options: { value: string; label: string }[]; error?: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select name={name} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <FieldError messages={error} />
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-red-600">{messages[0]}</p>;
}