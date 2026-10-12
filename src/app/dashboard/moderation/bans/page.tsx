import { redirect } from "next/navigation";

// The ban log was a v1 screen; v2 lists it as "soon" on Moderation.
export default function Page() {
    redirect("/dashboard/moderation");
}
