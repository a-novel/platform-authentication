FROM docker.io/library/node:24.5.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps

WORKDIR /usr/local/app

COPY package.json ./package.json
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
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY vite.config.ts ./vite.config.ts
COPY vite-env.d.ts ./vite-env.d.ts
COPY modules.d.ts ./modules.d.ts
COPY mui.d.ts ./mui.d.ts
COPY public ./public
COPY src/assets ./src/assets
COPY src/components ./src/components
COPY src/connectors ./src/connectors
COPY src/lib ./src/lib
COPY src/routes ./src/routes
COPY src/router.tsx ./src/router.tsx
COPY src/routeTree.gen.ts ./src/routeTree.gen.ts

COPY --from=deps /usr/local/app/node_modules /app/node_modules

RUN VITE_SERVER_PORT=8080 pnpm run build:ci

FROM docker.io/library/node:alpine

WORKDIR /

COPY --from=build /app/.output /.output
COPY --from=build /app/.nitro /app/.nitro
COPY --from=build /app/.tanstack /app/.tanstack

# ======================================================================================================================
# Healthcheck.
# ======================================================================================================================
RUN apk --update add curl

HEALTHCHECK --interval=1s --timeout=3s --retries=30 --start-period=1s \
    CMD curl --fail http://localhost:8080/api/healthcheck || exit 1

# ======================================================================================================================
# Finish setup.
# ======================================================================================================================
ENV PORT=8080
ENV VITE_SERVER_PORT=8080

EXPOSE 8080

ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
