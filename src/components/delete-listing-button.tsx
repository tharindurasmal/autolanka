"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteListing } from "@/server/actions/listing";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Delete this ad? This can't be undone.")) return;
        startTransition(() => deleteListing(listingId));
      }}
      disabled={pending}
      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}