"use client";

import Image from "next/image";
import { useState } from "react";
import { X, Star } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

export type UploadedImage = { url: string; key: string };

interface Props {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value, onChange, maxFiles = 10 }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const remaining = maxFiles - value.length;

  const { startUpload, isUploading } = useUploadThing("listingImages", {
    onClientUploadComplete: (files) => {
      setError(null);
      setUploadProgress(0);
      onChange([
        ...value,
        ...files.map((f) => ({ url: f.ufsUrl, key: f.key })),
      ]);
    },
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
      setUploadProgress(progress);
    },
    onUploadError: (e) => {
      setError(e.message);
      setUploadProgress(0);
    },
  });

  function remove(key: string) {
    onChange(value.filter((img) => img.key !== key));
  }

  function makePrimary(key: string) {
    const target = value.find((i) => i.key === key);
    if (!target) return;
    onChange([target, ...value.filter((i) => i.key !== key)]);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;
    await startUpload(Array.from(files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;

    await startUpload(Array.from(files));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Photos <span className="text-gray-500">({value.length}/{maxFiles})</span>
        </label>
        {value.length > 0 && (
          <span className="text-xs text-gray-500">First photo is the cover image</span>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {value.map((img, i) => (
            <div key={img.key} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image src={img.url} alt={`Vehicle photo ${i + 1}`} fill sizes="(max-width: 640px) 33vw, 20vw" className="object-cover" />

              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-sky-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button type="button" onClick={() => makePrimary(img.key)} title="Make cover photo" className="rounded-full bg-white p-1.5 text-slate-700 hover:text-sky-600">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => remove(img.key)} title="Remove" className="rounded-full bg-white p-1.5 text-slate-700 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
              isDragging
                ? "border-sky-500 bg-sky-50"
                : "border-slate-300 bg-white"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">
                  Drag photos here or click to browse
                </div>
                <div className="text-xs text-slate-500">
                  JPG, PNG or WebP · max 4MB each ({remaining} left)
                </div>
              </div>
            </label>
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Uploading photos</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}