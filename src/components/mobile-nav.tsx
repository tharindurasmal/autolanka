"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export function MobileNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass =
    "block rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-600";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 top-0 max-h-screen overflow-y-auto rounded-b-3xl bg-white p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-2 py-2">
              <span className="text-lg font-black tracking-tight text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              <Link href="/vehicles" className={linkClass}>
                Browse
              </Link>

              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link href="/dashboard" className={linkClass}>
                      Dashboard
                    </Link>
                  )}
                  <Link href="/dashboard/profile" className={linkClass}>
                    Profile
                  </Link>
                  <Link href="/dashboard/ads" className={linkClass}>
                    My ads
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/listings" className={linkClass}>
                      Admin
                    </Link>
                  )}

                  <div className="my-2 border-t border-slate-100" />

                  <div className="px-1">
                    <SignOutButton />
                  </div>

                  <Link
                    href="/sell"
                    className="mt-3 rounded-xl bg-yellow-500 px-4 py-3 text-center text-base font-semibold text-slate-900 transition hover:bg-yellow-400"
                  >
                    Post free ad
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkClass}>
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-3 rounded-xl bg-sky-500 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}