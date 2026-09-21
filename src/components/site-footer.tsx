import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <p className="text-lg font-black tracking-tight text-slate-900">AutoLanka</p>
          <p className="max-w-sm text-sm leading-6 text-slate-500">
            Buy and sell cars, vans, SUVs, bikes and more across Sri Lanka.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Explore</p>
          <div className="space-y-2 text-sm text-slate-600">
            <Link href="/vehicles" className="block transition hover:text-sky-600">Browse listings</Link>
            <Link href="/sell" className="block transition hover:text-sky-600">Post an ad</Link>
            <Link href="/dashboard/ads" className="block transition hover:text-sky-600">My ads</Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Support</p>
          <div className="space-y-2 text-sm text-slate-600">
            <Link href="/dashboard/profile" className="block transition hover:text-sky-600">Profile</Link>
            <Link href="/login" className="block transition hover:text-sky-600">Sign in</Link>
            <Link href="/register" className="block transition hover:text-sky-600">Register</Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Marketplace</p>
          <p className="text-sm leading-6 text-slate-500">
            Fresh listings, quick review, and a simple mobile-first experience.
          </p>
        </div>
      </div>
    </footer>
  );
}