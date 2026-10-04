'use client';

import { Guara } from "@/components/icons/Nextfur";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFoundContent() {
    const t = useTranslations("HTTPCodes");
    const tc = useTranslations("Commands");
    return <main className=" relative min-h-screen w-full flex flex-col overflow-hidden z-0">
        <span className="flex flex-col items-center justify-center w-full h-full text-[300px] md:text-[600px] text-error/20 absolute font-black break-keep top-auto left-auto right-auto bottom-auto">404</span>
        <main className="relative flex flex-col w-full items-center justify-center min-h-screen gap-2 text-center p-8">
            <div className=" relative h-52 w-52">
                <div className="absolute h-52 w-52 bg-error/50 rounded-full blur-3xl" />
                <div className="absolute h-52 w-52 text-error">
                    <Guara />
                </div>
            </div>

            <h1 className=" text-error">404</h1>
            <p>
                {t("404")}
            </p>
            <Link href={"/"}>
                <button className=" primary danger">
                    {tc("back_home")}
                    <HomeIcon />
                </button>
            </Link>
        </main>
    </main>
}