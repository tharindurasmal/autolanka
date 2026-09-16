"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavourite } from "@/server/actions/favourite";

export function FavouriteButton({ listingId, signedIn }: { listingId: string; signedIn: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={() => {
        if (!signedIn) return router.push("/login");
        setSaved((s) => !s);
        startTransition(() => toggleFavourite(listingId));
      }}
      disabled={pending}
      className="rounded-full border p-2 hover:bg-gray-50"
    >
      <Heart className={saved ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"} />
    </button>
  );
}