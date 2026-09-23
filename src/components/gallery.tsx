"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingImage } from "@prisma/client";

export function Gallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="aspect-[16/10] w-full" />
      </div>
    );
  }

  const handleNext = () => {
    setActive((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Main Image Container */}
      <div className="relative group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-center bg-white px-2 py-2 sm:px-3 sm:py-3">
          <Image
            src={images[active].url}
            alt={`${title} - photo ${active + 1}`}
            width={1200}
            height={1200}
            sizes="(max-width: 1024px) 100vw, 960px"
            priority
            className="max-h-[72vh] w-full object-contain transition-opacity duration-300"
          />
        </div>

        {/* Overlay Navigation & Counter (Only show if multiple images exist) */}
        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 focus:outline-none sm:h-12 sm:w-12"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 focus:outline-none sm:h-12 sm:w-12"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            {/* Image Counter Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm sm:bottom-6 sm:text-sm">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              type="button"
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                i === active
                  ? "border-sky-500 shadow-[0_8px_20px_rgba(14,116,144,0.22)]"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}