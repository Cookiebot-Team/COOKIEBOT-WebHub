import { useTranslations } from 'next-intl';

// Left brand panel of the desktop sign-in layout (lg: and up). Mirrors the v2 sidebar look.
export function DesktopAuthBrand() {
    const t = useTranslations('WebHub.auth');
    const points = ['value1', 'value2', 'value3'] as const;
    return (
        <aside className="hidden flex-col justify-between bg-[linear-gradient(rgba(42,27,1,.93),rgba(42,27,1,.93)),url('/bg1.jpg')] bg-cover bg-center p-14 font-jost text-cb-cream-100 lg:flex xl:p-20">
            <div className="flex items-center gap-4">
                <img src="/cookiebot_avatar.jpeg" alt="" className="size-14 rounded-full object-cover shadow-[0_0_0_2px_#FFE9C9]" />
                <div className="flex flex-col leading-tight">
                    <span className="text-2xl font-bold text-cb-cream-50">Cookiebot</span>
                    <span className="text-sm text-cb-cream-100/70">WebHub</span>
                </div>
            </div>
            <div className="max-w-md">
                <h2 className="text-4xl font-bold leading-tight text-cb-cream-50 xl:text-5xl">{t('brandTagline')}</h2>
                <ul className="mt-8 flex flex-col gap-4 text-lg text-cb-cream-100/90">
                    {points.map((k) => (
                        <li key={k} className="flex gap-3">
                            <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-cb-warning" />
                            <span>{t(k)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <span aria-hidden />
        </aside>
    );
}
