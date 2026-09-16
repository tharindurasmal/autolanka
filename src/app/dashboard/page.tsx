import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();   // throws to /login if not signed in
  return <h1>Welcome back, {user.name}</h1>;
}