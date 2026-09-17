"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateListing, type ActionState } from "@/server/actions/listing";
import { ImageUploader, type UploadedImage } from "@/components/image-uploader";
import { VEHICLE_TYPES, CONDITIONS, FUEL_TYPES, TRANSMISSIONS } from "@/lib/constants";
import type { Brand, Model, District, Listing, ListingImage } from "@prisma/client";

type BrandWithModels = Brand & { models: Model[] };

type ListingWithRelations = Listing & {
  images: ListingImage[];
  brand: Brand;
  model: Model | null;
  district: District;
};

const initialState: ActionState = { success: false };

export function EditListingForm({
  listing,
  brands,
  districts,
}: {
  listing: ListingWithRelations;
  brands: BrandWithModels[];
  districts: District[];
}) {
  const [state, formAction] = useActionState(updateListing.bind(null, listing.id), initialState);
  const [images, setImages] = useState<UploadedImage[]>(
    listing.images.map((image) => ({
      url: image.url,
      key: image.key,
    })),
  );
  const [selectedBrandId, setSelectedBrandId] = useState(listing.brandId);

  const models = brands.find((b) => b.id === selectedBrandId)?.models ?? [];

  return (
    <form action={formAction} className="space-y-8 rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
      {state.message && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <Section title="Vehicle details">
        <Row>
          <Select
            name="vehicleType"
            label="Type"
            options={VEHICLE_TYPES}
            defaultValue={listing.vehicleType}
            error={state.fieldErrors?.vehicleType}
          />
          <Select
            name="condition"
            label="Condition"
            options={CONDITIONS}
            defaultValue={listing.condition}
            error={state.fieldErrors?.condition}
          />
        </Row>

        <Row>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
            <select
              name="brandId"
              required
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.brandId} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Model</label>
            <select
              name="modelId"
              value={listing.modelId ?? ""}
              disabled={!selectedBrandId}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white disabled:bg-slate-100"
            >
              <option value="">Select model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </Row>

        <Row>
          <Input
            name="trim"
            label="Trim / grade (optional)"
            defaultValue={listing.trim ?? ""}
            placeholder="G Grade, Sport..."
          />
          <Input
            name="year"
            label="Year"
            type="number"
            required
            defaultValue={String(listing.year)}
            error={state.fieldErrors?.year}
          />
        </Row>
      </Section>

      <Section title="Specs">
        <Row>
          <Input
            name="mileage"
            label="Mileage (km)"
            type="number"
            defaultValue={listing.mileage ?? ""}
          />
          <Input
            name="engineCc"
            label="Engine (cc)"
            type="number"
            defaultValue={listing.engineCc ?? ""}
          />
        </Row>
        <Row>
          <Select
            name="fuelType"
            label="Fuel type"
            options={FUEL_TYPES}
            defaultValue={listing.fuelType}
            error={state.fieldErrors?.fuelType}
          />
          <Select
            name="transmission"
            label="Transmission"
            options={TRANSMISSIONS}
            defaultValue={listing.transmission}
            error={state.fieldErrors?.transmission}
          />
        </Row>
        <Input
          name="exteriorColor"
          label="Exterior colour (optional)"
          defaultValue={listing.exteriorColor ?? ""}
        />
      </Section>

      <Section title="Price">
        <Row>
          <Input
            name="price"
            label="Price (Rs.)"
            type="number"
            required
            defaultValue={String(listing.price)}
            error={state.fieldErrors?.price}
          />
          <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="negotiable"
              defaultChecked={listing.negotiable}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Negotiable
          </label>
        </Row>
      </Section>

      <Section title="Location & contact">
        <Row>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
            <select
              name="districtId"
              required
              defaultValue={listing.districtId}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.districtId} />
          </div>
          <Input
            name="city"
            label="City / town"
            required
            defaultValue={listing.city}
            error={state.fieldErrors?.city}
          />
        </Row>
        <Row>
          <Input
            name="contactName"
            label="Contact name"
            required
            defaultValue={listing.contactName}
            error={state.fieldErrors?.contactName}
          />
          <Input
            name="contactPhone"
            label="Phone"
            type="tel"
            placeholder="07XXXXXXXX"
            required
            defaultValue={listing.contactPhone}
            error={state.fieldErrors?.contactPhone}
          />
        </Row>
      </Section>

      <Section title="Description">
        <textarea
          name="description"
          rows={6}
          required
          defaultValue={listing.description}
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
      className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_20px_rgba(14,116,144,0.25)] transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving changes..." : "Save changes"}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-lg font-bold text-slate-900">{title}</legend>
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
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
      />
      <FieldError messages={error} />
    </div>
  );
}

function Select({
  label,
  options,
  error,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  error?: string[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        required
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
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
