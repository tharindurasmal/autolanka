"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/lib/auth-client";
import { User, Mail, Phone, Lock, CheckCircle, Search, Tag, ShieldCheck } from "lucide-react";

function getAuthErrorMessage(value: unknown): string {
  if (!value) return "Something went wrong. Please try again.";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (Array.isArray(obj.errors) && obj.errors.length > 0) return getAuthErrorMessage(obj.errors[0]);
    if (obj.error && typeof obj.error === "object") return getAuthErrorMessage(obj.error);
  }

  return "Something went wrong. Please try again.";
}

function validateSriLankanPhone(phone: string): boolean {
  // Sri Lankan phone validation: +94XXXXXXXXX only
  const cleanPhone = phone.replace(/[\s\-]/g, "");
  return /^\+94[0-9]{9}$/.test(cleanPhone);
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPhoneError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    // Validate phone
    if (!validateSriLankanPhone(phone)) {
      setPhoneError("Please enter a valid Sri Lankan phone number (e.g., +94712345678)");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!signUp || typeof signUp.email !== "function") {
      setError("Authentication client not available.");
      setLoading(false);
      return;
    }

    type SignUpEmailInput = Parameters<typeof signUp.email>[0];
    const result = await signUp.email({ name, email, password, phone } as unknown as SignUpEmailInput);
    const r = result as Record<string, unknown>;
    const authError = r.error ?? (Array.isArray(r.errors) ? r.errors[0] : null) ?? null;

    if (authError) {
      setError(getAuthErrorMessage(authError));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex h-full w-full">
      {/* Left: hero photo panel — hidden on small screens */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="/login-hero1.jpg"
          alt="Vehicles available on BuyCarLK"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
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
              List your vehicle
              <br />
              in minutes
            </h1>
            <div className="mt-5 h-1 w-14 bg-sky-500" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-200">
              Create a free account to post ads, message buyers, and track every inquiry in one place.
            </p>
          </div>

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
                Post a free ad
              </span>
            </Link>
            <div className="flex flex-col items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-400" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wide text-white">
                Verified sellers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex h-full w-full flex-1 items-center justify-center overflow-y-auto bg-white px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 flex items-center justify-center lg:hidden">
            <Image src="/newlogo.png" alt="BuyCarLK" width={1286} height={440} priority className="h-9 w-auto" />
          </Link>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Get started</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
            <p className="mt-1.5 text-sm text-slate-500">It only takes a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone number (Sri Lanka)
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="+94712345678"
                />
              </div>
              {phoneError && <p className="mt-1 text-xs font-medium text-red-600">{phoneError}</p>}
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
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                <CheckCircle className="h-3.5 w-3.5 text-sky-500" />
                At least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-sky-600 transition hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}