"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

interface MobileNavProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export function MobileNav({ isLoggedIn, isAdmin }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the drawer when the route changes — done during render
  // (not in an effect) per React's "adjusting state when a prop
  // changes" pattern, avoiding the cascading-render lint error.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[80vw] transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <span className="text-sm font-semibold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-4 text-sm font-medium text-slate-700">
          <Link href="/vehicles" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-slate-100">
            Browse
          </Link>

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-slate-100">
                  Dashboard
                </Link>
              )}
              <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-slate-100">
                Profile
              </Link>
              <Link href="/dashboard/ads" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-slate-100">
                My ads
              </Link>
              {isAdmin && (
                <Link href="/admin/listings" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-slate-100">
                  Admin
                </Link>
              )}

              <div className="mt-2 border-t border-slate-200 pt-2">
                <SignOutButton />
              </div>

              <Link
                href="/sell"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-yellow-500 px-4 py-2.5 text-center font-semibold text-slate-900 transition hover:bg-yellow-400"
              >
                Post free ad
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 hover:bg-slate-100">
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-sky-500 px-4 py-2.5 text-center font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}