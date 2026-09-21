import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "My profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      phoneVerified: true,
      role: true,
      createdAt: true,
    },
  });

  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Profile details</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm text-slate-500">Full name</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{profile.name}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Email</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{profile.email}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Phone</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{profile.phone ?? "Not set"}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Role</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{profile.role}</div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-slate-900">Account actions</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href="/dashboard/profile/edit" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Edit profile</a>
          </div>
        </div>
      </div>
    </div>
  );
}
