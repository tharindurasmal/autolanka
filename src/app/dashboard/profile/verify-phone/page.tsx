import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!/^07\d{8}$/.test(phone)) {
    throw new Error("Phone number must be in the format 07XXXXXXXX");
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone,
      phoneVerified: false,
      phoneOtp: otp,
      phoneOtpExpiresAt: otpExpiresAt,
    },
  });

  // Replace this with your SMS provider later.
  console.log(`Phone verification OTP for ${user.id}: ${otp}`);

  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile/verify-phone?sent=1");
}

async function verifyOtpAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const otp = String(formData.get("otp") ?? "").trim();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phoneOtp: true, phoneOtpExpiresAt: true, phoneVerified: true },
  });

  if (!profile?.phoneOtp || !profile.phoneOtpExpiresAt || profile.phoneOtpExpiresAt < new Date()) {
    throw new Error("Your OTP is expired or invalid.");
  }

  if (profile.phoneOtp !== otp) {
    throw new Error("The OTP is incorrect.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneVerified: true,
      phoneOtp: null,
      phoneOtpExpiresAt: null,
    },
  });

  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile");
}

export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string }>; 
}) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phone: true, phoneVerified: true },
  });

  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Security</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Verify phone number</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          Current phone: <span className="font-semibold">{profile.phone ?? "Not set"}</span>
        </div>

        {params.sent === "1" ? (
          <form action={verifyOtpAction} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
              <input name="otp" required placeholder="123456" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
            </div>
            <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Verify OTP</button>
          </form>
        ) : (
          <form action={sendOtpAction} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
              <input name="phone" defaultValue={profile.phone ?? ""} required placeholder="07XXXXXXXX" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
            </div>
            <button type="submit" className="w-full rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white">Send OTP</button>
          </form>
        )}

        {profile.phoneVerified && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            This phone number is verified.
          </div>
        )}
      </div>
    </div>
  );
}
