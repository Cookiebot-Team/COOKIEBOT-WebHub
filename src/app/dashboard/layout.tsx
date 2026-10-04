import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { DesignProvider } from '@/components/webhub/design/DesignProvider';
import { WebHubProvider } from '@/components/webhub/WebHubProvider';

export const metadata: Metadata = { title: 'Set Up' };

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-dvh bg-[#1E1E1E]">
            <WebHubProvider>
                <DesignProvider>{children}</DesignProvider>
            </WebHubProvider>
        </div>
    );
}
