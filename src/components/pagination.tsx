"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <Link
        href={hrefForPage(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`rounded-lg border px-3 py-1.5 text-sm ${
          currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
        }`}
      >
        Previous
      </Link>

      <span className="px-3 text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={hrefForPage(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`rounded-lg border px-3 py-1.5 text-sm ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}