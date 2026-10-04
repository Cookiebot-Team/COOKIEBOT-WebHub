import { NextRequest, NextResponse } from 'next/server';
import { resolveConfig } from '@/lib/cb/server-config';

// Development only: same-origin proxy to the selected Cookiebot v2 API. In
// production the native server (server/main.ts) does this, with the same
// configuration rules (src/lib/cb/server-config.ts). v2's CORS allowlist omits
// PATCH, and the environment is picked at runtime, so a rewrite would not do.
export const dynamic = 'force-dynamic';

const FORWARDED_HEADERS = ['authorization', 'content-type', 'accept'];

async function proxy(request: NextRequest, { params }: { params: { env: string; path: string[] } }) {
    const base = resolveConfig(process.env, true).apiUrl(params.env);
    if (!base) {
        return NextResponse.json({ detail: `environment "${params.env}" is not configured` }, { status: 503 });
    }

    const target = `${base}/${params.path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }

    const hasBody = !['GET', 'HEAD'].includes(request.method);
    try {
        const upstream = await fetch(target, {
            method: request.method,
            headers,
            body: hasBody ? await request.arrayBuffer() : undefined,
            cache: 'no-store',
        });
        return new NextResponse(upstream.body, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
        });
    } catch {
        return NextResponse.json({ detail: `${params.env} API unreachable` }, { status: 502 });
    }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
