"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { Mail, Lock, Search, Tag, Phone } from "lucide-react";

function getAuthErrorMessage(value: unknown): string {
  if (!value) return "Invalid email or password.";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (Array.isArray(obj.errors) && obj.errors.length > 0) return getAuthErrorMessage(obj.errors[0]);
    if (obj.error && typeof obj.error === "object") return getAuthErrorMessage(obj.error);
  }

  return "Invalid email or password.";
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    const r = result as Record<string, unknown>;
    const authError = r.error ?? (Array.isArray(r.errors) ? r.errors[0] : null) ?? null;
    if (authError) {
      setError(getAuthErrorMessage(authError));
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex h-full w-full">
      {/* Left: hero photo panel — hidden on small screens */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="/login-hero.jpg"
          alt="Vehicles available on BuyCarLK"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* Navy readability overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,18,32,0.75) 0%, rgba(11,18,32,0.35) 45%, rgba(11,18,32,0.85) 100%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between px-12 py-12">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-black tracking-tight text-white">
              BuyCar<span className="text-sky-400">LK</span>
            </span>
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Sri Lanka&rsquo;s Trusted Marketplace
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-[1.05] tracking-tight text-white xl:text-5xl">
              Buy and sell
              <br />
              with confidence
            </h1>
            <div className="mt-5 h-1 w-14 bg-sky-500" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-200">
              Sign in to manage your listings, track inquiries, and pick up your search right where you left off.
            </p>
          </div>

          {/* Quick-link row, echoing a dealer site's service-icon strip */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            <Link href="/vehicles" className="group flex flex-col items-start gap-2">
              <Search className="h-5 w-5 text-sky-400" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wide text-white group-hover:text-sky-400">
                Browse vehicles
              </span>
            </Link>
            <Link href="/sell" className="group flex flex-col items-start gap-2">
              <Tag className="h-5 w-5 text-sky-400" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wide text-white group-hover:text-sky-400">
                Sell your vehicle
              </span>
            </Link>
            <a href="tel:+94110000000" className="group flex flex-col items-start gap-2">
              <Phone className="h-5 w-5 text-sky-400" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wide text-white group-hover:text-sky-400">
                Contact support
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex h-full w-full flex-1 items-center justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center justify-center lg:hidden">
            <Image src="/newlogo.png" alt="BuyCarLK" width={1286} height={440} priority className="h-9 w-auto" />
          </Link>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
            <p className="mt-1.5 text-sm text-slate-500">Enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <span className="mt-0.5 font-bold text-red-500">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-sky-600 transition hover:text-sky-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}