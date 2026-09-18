import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";
import Image from "next/image";

export async function SiteHeader() {
  const session = await getSession();

  let isAdmin = false;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    isAdmin = dbUser?.role === "ADMIN";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
        <span className="relative flex h-14 w-38 items-center justify-center">
          <Image src="/newlogo.png" alt="AutoLanka" fill priority />
        </span>
      </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/vehicles" className="transition hover:text-sky-600">Browse</Link>

          {session?.user ? (
            <>
              {isAdmin && (
                <Link href="/dashboard" className="transition hover:text-sky-600">Dashboard</Link>
              )}
              <Link href="/dashboard/profile" className="transition hover:text-sky-600">Profile</Link>
              <Link href="/dashboard/ads" className="transition hover:text-sky-600">My ads</Link>
              {isAdmin && (
                <Link href="/admin/listings" className="transition hover:text-sky-600">Admin</Link>
              )}
              <SignOutButton />
              <Link
                href="/sell"
                className="rounded-full bg-yellow-500 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-yellow-400"
              >
                Post free ad
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-sky-600">Sign in</Link>
              <Link
                href="/register"
                className="rounded-full bg-sky-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}