"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { deleteListing } from "@/server/actions/listing";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteListing(listingId);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {pending ? "Deleting..." : "Delete"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-500">
                  Delete ad
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Are you sure?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              This will permanently remove the listing and all uploaded photos.
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Deleting..." : "Delete listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}