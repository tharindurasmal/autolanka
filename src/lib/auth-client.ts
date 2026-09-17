import { createAuthClient } from "better-auth/react";

const sanitizeUrl = (value: string | undefined) =>
  value?.trim().replace(/^['"]+|['"]+$/g, "") || undefined;

const baseURL =
  sanitizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;