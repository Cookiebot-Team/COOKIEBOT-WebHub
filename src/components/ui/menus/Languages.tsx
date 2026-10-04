"use client";

import SimpleDropdown, { DropdownButton } from "../Dropdown";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import HRDivider from "../ornaments/Dividers";
import { GlobeAmericasIcon, LanguageIcon } from "@heroicons/react/24/solid";
import { useSetLocale } from '@/providers/LocaleProvider';
import { Locale } from "@/config";

export function DropdownLangSelector({ type = "only-icon" }: { type?: "only-icon" | "secondary" }) {
    const t = useTranslations("Common.settings.lang");
    const l = useLocale();

    const setUserLocale = useSetLocale();
    const [isPending, startTransition] = useTransition();

    function onChange(value: string) {
        const locale = value as Locale;
        startTransition(() => {
            setUserLocale(locale);
        });
    }

    return <SimpleDropdown
        disabled={isPending}
        icon={<GlobeAmericasIcon />}
        type={type}
        buttonText={type != "only-icon" ? t("_") : ""}
        closeOnClick={false}>
        <h5 className="px-4 flex flex-row gap-2 items-center"><GlobeAmericasIcon className=" h-7 w-7" /> {t("_")} </h5>
        <HRDivider />
        <DropdownButton callback={async () => { if (l !== "pt") onChange("pt") }} active={l === "pt"}>
            <LanguageIcon />
            {t("pt-br")}
        </DropdownButton>
        <DropdownButton callback={async () => { if (l !== "en") onChange("en") }} active={l === "en"}>
            <LanguageIcon />
            {t("en-us")}
        </DropdownButton>
        <DropdownButton callback={async () => { if (l !== "es") onChange("es") }} active={l === "es"}>
            <LanguageIcon />
            {t("es-es")}
        </DropdownButton>
    </SimpleDropdown>
}