"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Car, 
  CarFront, 
  Bus, 
  Truck, 
  Bike, 
  PlusCircle,
  Van
} from "lucide-react";
import { SignOutButton } from "./sign-out-button";

const QUICK_CATEGORIES = [
  { name: "Sell Vehicle", icon: PlusCircle, href: "/sell", isSell: true },
  { name: "Cars", icon: Car, href: "/vehicles?type=CAR" },
  { name: "SUVs", icon: CarFront, href: "/vehicles?type=SUV" },
  { name: "Vans", icon: Van, href: "/vehicles?type=VAN" },
  { name: "Buses", icon: Bus, href: "/vehicles?type=BUS" },
  { name: "Bikes", icon: Bike, href: "/vehicles?type=MOTORBIKE" },
  { 
    name: "Three Wheels", 
    customIcon: "/icons/rickshaw.png",
    href: "/vehicles?type=THREE_WHEEL" 
  },
  { name: "Lorries", icon: Truck, href: "/vehicles?type=LORRY" },
  { 
    name: "Pickups", 
    customIcon: "/icons/pickup-truck.png",
    href: "/vehicles?type=PICKUP" 
  },
  { 
    name: "Heavy Duty", 
    customIcon: "/icons/excavator.png",
    href: "/vehicles?type=HEAVY_DUTY" 
  },
];

export function MobileNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => setOpen(false);

  const linkClass =
    "block rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-50 hover:text-sky-600";

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
            onClick={handleClose}
          />

          <div className="absolute inset-x-0 top-0 max-h-[95vh] overflow-y-auto rounded-b-3xl bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-2 py-2">
              <span className="text-lg font-black tracking-tight text-slate-900">Menu</span>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Horizontally Scrollable Category Bar */}
            <div className="mb-6 flex gap-3 overflow-x-auto px-1 pb-3 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {QUICK_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={handleClose}
                    className={`flex w-[82px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border p-2.5 text-center transition-all active:scale-95 ${
                      category.isSell 
                        ? "border-yellow-200 bg-yellow-50/80 text-yellow-800 hover:bg-yellow-100" 
                        : "border-sky-100 bg-[#edf3ff] text-slate-800 hover:bg-sky-100/70"
                    }`}
                  >
                    {category.customIcon ? (
                      <div className="relative h-7 w-7">
                        <Image
                          src={category.customIcon}
                          alt={category.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      IconComponent && <IconComponent className="h-7 w-7" strokeWidth={1.75} />
                    )}
                    <span className="text-[11px] font-bold leading-tight">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <nav className="flex flex-col gap-1">
              <Link href="/vehicles" onClick={handleClose} className={linkClass}>
                Browse All Vehicles
              </Link>

              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link href="/dashboard" onClick={handleClose} className={linkClass}>
                      Dashboard
                    </Link>
                  )}
                  <Link href="/dashboard/profile" onClick={handleClose} className={linkClass}>
                    Profile
                  </Link>
                  <Link href="/dashboard/ads" onClick={handleClose} className={linkClass}>
                    My ads
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/listings" onClick={handleClose} className={linkClass}>
                      Admin
                    </Link>
                  )}

                  <div className="my-2 border-t border-slate-100" />

                  <div className="px-1" onClick={handleClose}>
                    <SignOutButton />
                  </div>

                  <Link
                    href="/sell"
                    onClick={handleClose}
                    className="mt-3 rounded-xl bg-[#ffc800] px-4 py-3 text-center text-base font-bold text-slate-900 transition hover:bg-yellow-400"
                  >
                    Post free ad
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={handleClose} className={linkClass}>
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={handleClose}
                    className="mt-3 rounded-xl bg-sky-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-500"
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