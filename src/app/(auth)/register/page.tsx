"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { User, Mail, Phone, Lock, CheckCircle } from "lucide-react";

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

    const result = await signUp.email({ name, email, password, phone } as any);
    const authError = (result as any)?.error ?? (result as any)?.errors?.[0] ?? null;

    if (authError) {
      setError(getAuthErrorMessage(authError));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Decorative background element */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-sky-500" />
                <input
                  name="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-sky-500" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Phone number (Sri Lanka)</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-sky-500" />
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="+94712345678"
                />
              </div>
              {phoneError && (
                <p className="mt-1 text-xs text-red-600 font-medium">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-sky-500" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-sky-500" />
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-sky-500" />
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-sm text-red-700 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-sky-500 to-sky-600 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}