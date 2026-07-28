import { redirect } from "next/navigation";

/** The daily verse now greets you on Home; old /today links follow it there. */
export default function TodayPage() {
  redirect("/");
}
