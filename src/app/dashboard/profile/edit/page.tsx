import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function updateProfileAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: phone || null,
      phoneVerified: false,
    },
  });

  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile");
}

export default async function EditProfilePage() {
  const user = await requireUser();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, phone: true, email: true },
  });

  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Edit profile</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={updateProfileAction} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input name="name" defaultValue={profile.name} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input value={profile.email} disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input name="phone" defaultValue={profile.phone ?? ""} placeholder="07XXXXXXXX" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Save changes</button>
            <a href="/dashboard/profile" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
}
