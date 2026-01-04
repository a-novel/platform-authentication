FROM docker.io/library/node:24.11.1-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps

WORKDIR /usr/local/app

COPY package.json ./package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/platform/package.json ./packages/platform/package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN --mount=type=secret,id=npmrc,target=/usr/local/app/.npmrc \
    # Dev dependencies are required to build the vite project. They will be scraped anyway from the
    # final build.
    pnpm install --frozen-lockfile

FROM base AS build

WORKDIR /app

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/auth/svelte.config.js ./packages/auth/svelte.config.js
COPY packages/auth/tsconfig.json ./packages/auth/tsconfig.json
COPY packages/auth/vite.config.ts ./packages/auth/vite.config.ts
COPY packages/auth/src ./packages/auth/src

COPY packages/platform/package.json ./packages/platform/package.json
COPY packages/platform/package.json ./packages/platform/package.json
COPY packages/platform/svelte.config.js ./packages/platform/svelte.config.js
COPY packages/platform/tsconfig.json ./packages/platform/tsconfig.json
COPY packages/platform/vite.config.ts ./packages/platform/vite.config.ts
COPY packages/platform/src ./packages/platform/src
COPY packages/platform/.env ./packages/platform/.env

COPY --from=deps /usr/local/app/node_modules /app/node_modules
COPY --from=deps /usr/local/app/packages/auth/node_modules /app/packages/auth/node_modules
COPY --from=deps /usr/local/app/packages/platform/node_modules /app/packages/platform/node_modules

RUN pnpm run build:auth && pnpm build:platform

FROM docker.io/library/node:24.11.1-alpine

WORKDIR /

COPY --from=build /app/packages/platform/.svelte-kit .svelte-kit
COPY --from=build /app/packages/platform/build build/
COPY --from=build /app/packages/platform/node_modules node_modules/
COPY --from=build /app/packages/platform/package.json package.json

EXPOSE 8080

# Inject env variables at runtime.
COPY scripts/env.sh /usr/local/bin/env.sh
RUN chmod +x /usr/local/bin/env.sh

COPY builds/platform.entrypoint.sh /usr/local/bin/platform.entrypoint.sh
RUN chmod +x ./usr/local/bin/platform.entrypoint.sh

# ======================================================================================================================
# Healthcheck.
# ======================================================================================================================
RUN apk --update add curl bash

HEALTHCHECK --interval=1s --timeout=3s --retries=30 --start-period=1s \
    CMD curl --fail http://localhost:3000/api/ping || exit 1

# ======================================================================================================================
# Finish setup.
# ======================================================================================================================
EXPOSE 3000

ENV HOST=0.0.0.0

ENTRYPOINT ["/usr/local/bin/platform.entrypoint.sh"]
CMD ["node", "build"]
