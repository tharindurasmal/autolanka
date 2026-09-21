import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";

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
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <MobileNav isLoggedIn={Boolean(session?.user)} isAdmin={isAdmin} />

          <Link href="/" className="flex items-center justify-end text-xl font-black tracking-tight text-slate-900">
            <Image
              src="/newlogo.png"
              alt="AutoLanka"
              width={154}
              height={48}
              priority
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
            <Image
              src="/newlogo.png"
              alt="AutoLanka"
              width={154}
              height={48}
              priority
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-slate-600 sm:gap-3">
          <Link href="/vehicles" className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600">Browse</Link>

          {session?.user ? (
            <>
              {isAdmin && (
                <Link href="/dashboard" className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600">Dashboard</Link>
              )}
              <Link href="/dashboard/profile" className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600">Profile</Link>
              <Link href="/dashboard/ads" className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600">My ads</Link>
              {isAdmin && (
                <Link href="/admin/listings" className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600">Admin</Link>
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
              <Link href="/login" className="rounded-full bg-slate-100 px-3 py-2 transition hover:bg-sky-50 hover:text-sky-600">Sign in</Link>
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
      </div>
    </header>
  );
}