"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

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

    // `signUp.email` typings may not include custom fields like `phone`.
    // Cast to `any` to pass additional fields handled by the server adapter.
    const result = await signUp.email({ name, email, password, phone } as any);

    const error = (result as any)?.error ?? (result as any)?.errors?.[0] ?? null;

    if (error) {
      setError((error as any).message ?? String(error) ?? "Could not create your account.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">
        Free. Post your first ad in two minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" placeholder="07XXXXXXXX" required />
        <Field label="Password" name="password" type="password" required minLength={8} />
        <Field label="Confirm password" name="confirm" type="password" required minLength={8} />

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white
                     hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={props.name}
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}