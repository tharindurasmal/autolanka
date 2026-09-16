"use client";

import { useState } from "react";
import Image from "next/image";
import type { ListingImage } from "@prisma/client";

export function Gallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-video rounded-xl bg-gray-100" />;
  }

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={images[active].url}
          alt={`${title} - photo ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-blue-600" : "border-transparent"
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