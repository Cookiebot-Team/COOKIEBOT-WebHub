import { resolveConfig } from '@/lib/cb/server-config';

// Development only (`.dev.ts` is a page extension under `next dev`, not in the
// static export): the native server (server/main.ts) serves this in production.
export const dynamic = 'force-dynamic';

export function GET() {
    return new Response(resolveConfig(process.env, true).toScript(), {
        headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' },
    });
}
