// Cookiebot WebHub server: one native executable (compiled with scriptc) that
//   - serves the static Next.js export embedded at build time (assets.gen.ts),
//   - serves /runtime-config.js from environment variables,
//   - proxies /cb/{env}/... to the Cookiebot v2 API and /api/botserver/... to
//     the v1 botserver (same origin, so no CORS),
//   - answers /healthz for Kubernetes probes and drains on SIGTERM.
// Configuration: src/lib/cb/server-config.ts, plus PORT and HOST.

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { resolveConfig, ServerConfig } from "../src/lib/cb/server-config";
import { Asset } from "./asset";
import { ASSETS } from "./assets.gen";

const MAX_BODY_BYTES = 1024 * 1024;
const FORWARDED_HEADERS: string[] = ["authorization", "content-type", "accept"];

const config: ServerConfig = resolveConfig(process.env, false);
const runtimeScript: string = config.toScript();

const assets = new Map<string, Asset>();
for (const asset of ASSETS) assets.set(asset.path, asset);

function header(req: IncomingMessage, name: string): string {
    const value = req.headers[name];
    if (value === undefined) return "";
    return Array.isArray(value) ? value.join(", ") : String(value);
}

function baseHeaders(): { [key: string]: string } {
    return {
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
    };
}

function sendText(res: ServerResponse, status: number, type: string, body: string, cache: string): void {
    const headers = baseHeaders();
    headers["content-type"] = type;
    headers["cache-control"] = cache;
    res.writeHead(status, headers);
    res.end(body);
}

function sendJson(res: ServerResponse, status: number, detail: string): void {
    sendText(res, status, "application/json", JSON.stringify({ detail: detail }), "no-store");
}

function readBody(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;
        req.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) reject(new Error("body too large"));
            else chunks.push(chunk);
        });
        req.on("end", () => resolve(Buffer.concat(chunks as Uint8Array[])));
        req.on("error", (err: Error) => reject(err));
    });
}

async function proxy(req: IncomingMessage, res: ServerResponse, target: string, label: string): Promise<void> {
    const method = req.method === undefined ? "GET" : req.method;
    const headers: { [key: string]: string } = {};
    for (const name of FORWARDED_HEADERS) {
        const value = header(req, name);
        if (value !== "") headers[name] = value;
    }

    let body = "";
    if (method !== "GET" && method !== "HEAD") {
        try {
            body = (await readBody(req)).toString("utf8");
        } catch (err) {
            sendJson(res, 413, "request body too large");
            return;
        }
    }

    try {
        const upstream = await fetch(target, method === "GET" || method === "HEAD"
            ? { method: method, headers: headers }
            : { method: method, headers: headers, body: body });
        const bytes = Buffer.from(await upstream.arrayBuffer());
        const type = upstream.headers.get("content-type");
        const out = baseHeaders();
        out["content-type"] = type === null ? "application/json" : type;
        out["cache-control"] = "no-store";
        res.writeHead(upstream.status, out);
        res.end(bytes);
    } catch (err) {
        sendJson(res, 502, label + " unreachable");
    }
}

function findAsset(pathname: string): Asset | undefined {
    let path = pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, path.length - 1);
    if (path === "/") path = "/index.html";
    const exact = assets.get(path);
    if (exact !== undefined) return exact;
    const page = assets.get(path + ".html");
    if (page !== undefined) return page;
    return assets.get(path + "/index.html");
}

function serveAsset(req: IncomingMessage, res: ServerResponse, asset: Asset, status: number): void {
    asset.decode();
    const headers = baseHeaders();
    headers["content-type"] = asset.type;
    headers["etag"] = asset.etag;
    headers["vary"] = "accept-encoding";
    headers["cache-control"] = asset.immutable
        ? "public, max-age=31536000, immutable"
        : asset.type.startsWith("text/html") ? "no-cache" : "public, max-age=3600";

    if (status === 200 && header(req, "if-none-match") === asset.etag) {
        res.writeHead(304, headers);
        res.end();
        return;
    }

    const gzip = asset.gzip !== "" && header(req, "accept-encoding").includes("gzip");
    const bytes = gzip ? asset.gzipBytes : asset.rawBytes;
    if (gzip) headers["content-encoding"] = "gzip";
    headers["content-length"] = String(bytes.length);
    res.writeHead(status, headers);
    if (req.method === "HEAD") res.end();
    else res.end(bytes);
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url === undefined ? "/" : req.url, "http://localhost");
    const path = url.pathname;
    const method = req.method === undefined ? "GET" : req.method;

    if (path === "/healthz" || path === "/readyz") {
        sendText(res, 200, "text/plain; charset=utf-8", "ok", "no-store");
        return;
    }
    if (path === "/runtime-config.js") {
        sendText(res, 200, "text/javascript; charset=utf-8", runtimeScript, "no-store");
        return;
    }
    if (path.startsWith("/cb/")) {
        const rest = path.slice(4);
        const slash = rest.indexOf("/");
        const env = slash < 0 ? rest : rest.slice(0, slash);
        const base = config.apiUrl(env);
        if (base === "") {
            sendJson(res, 503, "environment \"" + env + "\" is not configured");
            return;
        }
        await proxy(req, res, base + (slash < 0 ? "/" : rest.slice(slash)) + url.search, env + " API");
        return;
    }
    if (path.startsWith("/api/botserver")) {
        await proxy(req, res, config.botserverUrl + path.slice(14) + url.search, "botserver");
        return;
    }

    if (method !== "GET" && method !== "HEAD") {
        sendJson(res, 405, "method not allowed");
        return;
    }
    const asset = findAsset(path);
    if (asset !== undefined) {
        serveAsset(req, res, asset, 200);
        return;
    }
    const notFound = assets.get("/404.html");
    if (notFound !== undefined) serveAsset(req, res, notFound, 404);
    else sendText(res, 404, "text/plain; charset=utf-8", "not found", "no-store");
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res).catch((err: unknown) => {
        console.error("request failed: " + String(err));
        sendJson(res, 500, "internal error");
    });
});

const port = Number(process.env.PORT === undefined ? "3000" : process.env.PORT);
const host = process.env.HOST === undefined ? "0.0.0.0" : process.env.HOST;

server.listen(port, host, () => {
    console.log("webhub listening on " + host + ":" + String(port) + " (env " + config.defaultEnv
        + ", api " + (config.envs.length > 0 ? "configured" : "NOT configured") + ", " + String(assets.size) + " assets)");
});

// Kubernetes sends SIGTERM, then SIGKILL after the grace period: stop taking
// connections and let in-flight requests finish.
function shutdown(signal: string): void {
    console.log(signal + " received, draining");
    server.close(() => process.exit(0));
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
