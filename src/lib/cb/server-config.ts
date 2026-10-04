// Runtime configuration, resolved from environment variables. Shared by the
// `next dev` routes and the native server (server/main.ts, compiled with
// scriptc), so it stays plain TypeScript: no Next.js, no Node-only APIs.
//
//   CB_ENV                 environment the build serves: local | dev | prd
//                          (default: prd in the native server, local in dev)
//   CB_API_URL             base URL of the Cookiebot v2 API for CB_ENV
//   CB_API_URL_LOCAL|DEV|PRD
//                          per-environment base URLs (the dev selector lists
//                          every one that is set; local defaults to :8000)
//   TELEGRAM_BOT_USERNAME  bot behind the Telegram Login Widget
//   SETTINGS_BACKEND       "mock" serves settings from memory (no API calls)
//   DESIGN_SWITCHER        "false" hides the v1/v2 design switcher
//   DESIGN_DEFAULT         v1 | v2, the design shown first (default v2)
//   BOTSERVER_URL          v1 botserver behind /api/botserver (group count)

export type Env = { [key: string]: string | undefined };

export class ServerConfig {
    apiUrls: string[];
    envs: string[];
    defaultEnv: string;
    selectable: boolean;
    botUsername: string;
    settingsBackend: string;
    designSwitcher: boolean;
    designDefault: string;
    botserverUrl: string;

    constructor(
        apiUrls: string[], envs: string[], defaultEnv: string, selectable: boolean, botUsername: string,
        settingsBackend: string, designSwitcher: boolean, designDefault: string, botserverUrl: string,
    ) {
        this.apiUrls = apiUrls;
        this.envs = envs;
        this.defaultEnv = defaultEnv;
        this.selectable = selectable;
        this.botUsername = botUsername;
        this.settingsBackend = settingsBackend;
        this.designSwitcher = designSwitcher;
        this.designDefault = designDefault;
        this.botserverUrl = botserverUrl;
    }

    // The API base URL for `env`, or "" when this build may not reach it.
    apiUrl(env: string): string {
        const index = ENVIRONMENTS.indexOf(env);
        if (index < 0 || this.envs.indexOf(env) < 0) return "";
        return this.apiUrls[index];
    }

    // What the browser gets as `window.__CB_CONFIG__`. API URLs stay
    // server-side: the browser only ever talks to /cb/{env}/...
    toScript(): string {
        const body = JSON.stringify({
            envs: this.envs,
            defaultEnv: this.defaultEnv,
            envSelectable: this.selectable,
            telegramBotUsername: this.botUsername,
            settingsBackend: this.settingsBackend,
            designSwitcher: this.designSwitcher,
            designDefault: this.designDefault,
        });
        return "window.__CB_CONFIG__=" + body + ";\n";
    }
}

export const ENVIRONMENTS: string[] = ["local", "dev", "prd"];

function value(env: Env, key: string): string {
    const raw = env[key];
    return raw === undefined ? "" : raw.trim();
}

function trimSlash(url: string): string {
    let out = url;
    while (out.endsWith("/")) out = out.slice(0, out.length - 1);
    return out;
}

// `development` is true under `next dev`: every configured environment is
// selectable there. A production server serves exactly one environment.
export function resolveConfig(env: Env, development: boolean): ServerConfig {
    const requested = value(env, "CB_ENV");
    const pinned = ENVIRONMENTS.indexOf(requested) >= 0 ? requested : (development ? "local" : "prd");

    const urls: string[] = [];
    for (const name of ENVIRONMENTS) {
        let url = value(env, "CB_API_URL_" + name.toUpperCase());
        if (url === "" && name === pinned) url = value(env, "CB_API_URL");
        if (url === "" && name === "local" && development) url = "http://localhost:8000";
        urls.push(trimSlash(url));
    }

    const envs: string[] = [];
    for (let i = 0; i < ENVIRONMENTS.length; i++) {
        const name = ENVIRONMENTS[i];
        if (urls[i] === "") continue;
        if (development || name === pinned) envs.push(name);
    }
    const defaultEnv = envs.indexOf(pinned) >= 0 ? pinned : (envs.length > 0 ? envs[0] : pinned);

    const backend = value(env, "SETTINGS_BACKEND") === "mock" ? "mock" : "http";
    const designDefault = value(env, "DESIGN_DEFAULT") === "v1" ? "v1" : "v2";
    const botUsername = value(env, "TELEGRAM_BOT_USERNAME");
    const botserver = value(env, "BOTSERVER_URL");

    return new ServerConfig(
        urls, envs, defaultEnv, development,
        botUsername === "" ? "CookieMWbot" : botUsername,
        backend,
        value(env, "DESIGN_SWITCHER") !== "false",
        designDefault,
        trimSlash(botserver === "" ? "https://botserver.cookiebotfur.net" : botserver),
    );
}
