"use client";

import Image from "next/image";
import { useState } from "react";
import { X, Upload, Star } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

export type UploadedImage = { url: string; key: string };

interface Props {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value, onChange, maxFiles = 10 }: Props) {
  const [error, setError] = useState<string | null>(null);
  const remaining = maxFiles - value.length;

  function remove(key: string) {
    onChange(value.filter((img) => img.key !== key));
  }

  function makePrimary(key: string) {
    const target = value.find((i) => i.key === key);
    if (!target) return;
    onChange([target, ...value.filter((i) => i.key !== key)]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Photos <span className="text-gray-500">({value.length}/{maxFiles})</span>
        </label>
        {value.length > 0 && (
          <span className="text-xs text-gray-500">
            First photo is the cover image
          </span>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((img, i) => (
            <div
              key={img.key}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
            >
              <Image
                src={img.url}
                alt={`Vehicle photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover"
              />

              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5
                                 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-2
                              bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(img.key)}
                    title="Make cover photo"
                    className="rounded-full bg-white p-1.5 text-gray-700 hover:text-blue-600"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.key)}
                  title="Remove"
                  className="rounded-full bg-white p-1.5 text-gray-700 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <UploadDropzone
          endpoint="listingImages"
          config={{ mode: "auto" }}
          onClientUploadComplete={(files) => {
            setError(null);
            onChange([
              ...value,
              ...files.map((f) => ({ url: f.ufsUrl, key: f.key })),
            ]);
          }}
          onUploadError={(e) => setError(e.message)}
          content={{
            label: `Drag photos here or click to browse (${remaining} left)`,
            allowedContent: "JPG, PNG or WebP · max 4MB each",
          }}
          className="ut-label:text-sm ut-label:text-gray-600
                     ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-400
                     ut-allowed-content:text-xs ut-allowed-content:text-gray-400
                     border-dashed border-gray-300 bg-white"
        />
      )}

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}