import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Returns the session, or null. Use when auth is optional. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Returns the user, or redirects to /login. Use to protect a page. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Returns the user only if they're an admin. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}