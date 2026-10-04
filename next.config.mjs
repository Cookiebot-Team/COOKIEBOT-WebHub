// Two modes:
// - `next dev`: dev-only routes (`*.dev.ts`: the /cb proxy and
//   /runtime-config.js) and the /api/botserver rewrite are active.
// - WEBHUB_EXPORT=1 `next build`: a static export into out/, which the native
//   server (server/main.ts) embeds and serves, proxies included.
const isExport = process.env.WEBHUB_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {},
    pageExtensions: isExport ? ['tsx', 'ts'] : ['dev.ts', 'tsx', 'ts'],
    ...(isExport
        ? { output: 'export', images: { unoptimized: true } }
        : {
            async rewrites() {
                return [
                    {
                        source: '/api/botserver/:path*',
                        destination: `${process.env.BOTSERVER_URL ?? 'https://botserver.cookiebotfur.net'}/:path*`,
                    },
                ];
            },
        }),
};

export default nextConfig;
