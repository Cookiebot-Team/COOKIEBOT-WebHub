"use client";

import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Sign-in happens on /dashboard, which exchanges the Telegram proof for a
// v2 session against the selected environment.
export default function UserMenu({ type = "only-icon" }: { type?: "only-icon" | "secondary" }) {
    const t = useTranslations("Common.auth");

    return (
        <Link href="/dashboard" prefetch={false} aria-label={t("signin")}
            className="flex items-center gap-2 rounded-full bg-[#2AABEE] px-3 py-2 text-sm font-bold text-white">
            <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
            {type === "secondary" && t("signin")}
        </Link>
    );
}
