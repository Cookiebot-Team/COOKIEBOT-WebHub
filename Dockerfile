# syntax=docker/dockerfile:1.7
#
# Cookiebot WebHub: one statically linked native binary on an empty image.
#
#   bun     installs dependencies, builds the Next.js static export and embeds
#           it (scripts/embed-assets.ts, pre-gzipped) into server/assets.gen.ts
#   scriptc compiles server/main.ts with the embedded assets to a native
#           executable (no Node, no JavaScript engine at runtime)
#
# Runtime configuration is environment variables only (one image for every
# environment); see src/lib/cb/server-config.ts and .env.example:
#   CB_API_URL, CB_ENV, TELEGRAM_BOT_USERNAME, SETTINGS_BACKEND,
#   DESIGN_SWITCHER, DESIGN_DEFAULT, BOTSERVER_URL, PORT, HOST
#
#   docker build --platform linux/amd64 -t cookiebot-webhub .
#   docker run -p 3000:3000 -e CB_API_URL=https://api.example.org cookiebot-webhub

ARG BUN_VERSION=1.3.14
ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.22

FROM oven/bun:${BUN_VERSION}-alpine AS bun

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build
# scriptc links with clang; musl's static libc makes the binary self-contained.
# Node stays only for scriptc's installer and the Next.js CLI; bun drives the build.
RUN apk add --no-cache clang lld gcc musl-dev ca-certificates
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
# Link fully statically so the image needs no libc at all. scriptc passes
# its own "-target <arch>-linux-musl"; Alpine's GCC (crtbeginT.o, libgcc.a)
# is installed under "<arch>-alpine-linux-musl", so the wrapper restates the
# target last, which clang honours.
RUN printf '#!/bin/sh\nexec clang "$@" -static --target="$(uname -m)-alpine-linux-musl"\n' > /usr/local/bin/clang-static \
    && chmod +x /usr/local/bin/clang-static
ENV SCRIPTC_LINKER=clang-static \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY package.json package-lock.json ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:binary && ls -la dist/webhub

# Smoke test before shipping: the binary starts and answers its health probe.
RUN (PORT=3999 ./dist/webhub &) && sleep 1 \
    && wget -qO- http://127.0.0.1:3999/healthz | grep -q ok \
    && wget -qO- http://127.0.0.1:3999/ | grep -q "<html"

FROM scratch AS runtime
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /app/dist/webhub /webhub
ENV PORT=3000 \
    HOST=0.0.0.0 \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
EXPOSE 3000
# Unprivileged, matching a Kubernetes `runAsNonRoot` security context.
USER 65532:65532
ENTRYPOINT ["/webhub"]
