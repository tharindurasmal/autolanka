import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AutoLanka
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/vehicles" className="hover:text-blue-600">Browse</Link>

          {session?.user ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-600">My ads</Link>
              <SignOutButton />
              <Link href="/sell"
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                Post free ad
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Sign in</Link>
              <Link href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}