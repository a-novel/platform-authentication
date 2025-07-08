FROM node:alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY .npmrc ./.npmrc

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm fetch prod

FROM base AS build

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY tsconfig.json ./tsconfig.json
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
COPY routeTree.gen.ts ./routeTree.gen.ts

COPY --from=deps /app/node_modules /app/node_modules

RUN pnpm run build

FROM base

ENV HOST="0.0.0.0"

ENV CLIENT_PORT=8080

EXPOSE 8080


