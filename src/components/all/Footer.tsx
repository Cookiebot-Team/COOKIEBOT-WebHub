'use client';

import { NextfurInline } from "../icons/Nextfur";
import { useTranslations } from "next-intl";
import HRDivider, { EnfDivider } from "../ui/ornaments/Dividers";

export function Footer() {
    const t = useTranslations('Footer');

    return (
        <>
            <div className="relative flex items-center justify-center bg-surface">
                <div className="w-full pt-10 pb-10 flex flex-col gap-8 justify-center items-center">
                    <div className="flex flex-col md:flex-wrap md:flex-row md:gap-24 gap-14 items-center justify-center px-6 pt-4">
                        <EnfDivider className="-my-4 md:-mx-12"/>
                    </div>
                    <HRDivider/>
                    <div className=" flex flex-col gap-2 items-center text-center justify-center px-6">
                        <p className="font-bold"><a href="https://github.com/MekhyW/COOKIEBOT-Telegram-Group-Bot">{t('rights.text')}</a></p>
                        <p><a href="https://nextfur.net">{t('rights.bottomtext')}</a></p>
                    </div>
                    
                </div>
            </div>
        </>
    );
}
