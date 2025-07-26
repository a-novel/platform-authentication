# Platform authentication

Standalone frontend for managing user accounts.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/agora_ecrivains)](https://twitter.com/agora_ecrivains)
[![Discord](https://img.shields.io/discord/1315240114691248138?logo=discord)](https://discord.gg/rp4Qr8cA)

<hr />

![GitHub repo file or directory count](https://img.shields.io/github/directory-file-count/a-novel/platform-authentication)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/a-novel/platform-authentication)

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/a-novel/platform-authentication/main.yaml)
[![codecov](https://codecov.io/gh/a-novel/platform-authentication/graph/badge.svg?token=arnRQVzqLP)](https://codecov.io/gh/a-novel/platform-authentication)

![Coverage graph](https://codecov.io/gh/a-novel/platform-authentication/graphs/sunburst.svg?token=arnRQVzqLP)

## Local development

Run the application locally with:

```bash
pnpm start
```

Run tests with:

```bash
pnpm test
```

## Deployment

Run as a containerized service with:

```yaml
# https://github.com/containers/podman-compose
services:
  # ================================================================================
  # JSON Keys Service
  # https://a-novel.github.io/service-json-keys/service/containerized.html
  # ================================================================================
  json-keys-postgres:
    image: ghcr.io/a-novel/service-json-keys/database:v1
    networks:
      - api
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: json-keys
      POSTGRES_HOST_AUTH_METHOD: scram-sha-256
      POSTGRES_INITDB_ARGS: --auth=scram-sha-256
    volumes:
      - json-keys-postgres-data:/var/lib/postgresql/data/

  json-keys-service:
    image: ghcr.io/a-novel/service-json-keys/standalone:v1
    depends_on:
      json-keys-postgres:
        condition: service_started
    environment:
      POSTGRES_DSN: postgres://postgres:postgres@json-keys-postgres:5432/json-keys?sslmode=disable
      APP_MASTER_KEY: fec0681a2f57242211c559ca347721766f8a3acd8ed2e63b36b3768051c702ca
    networks:
      - api

  # ================================================================================
  # Authentication Service
  # https://a-novel.github.io/service-authentication/service/containerized.html
  # ================================================================================
  authentication-postgres:
    image: ghcr.io/a-novel/service-authentication/database:v1
    networks:
      - api
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: authentication
      POSTGRES_HOST_AUTH_METHOD: scram-sha-256
      POSTGRES_INITDB_ARGS: --auth=scram-sha-256
    volumes:
      - authentication-postgres-data:/var/lib/postgresql/data/

  authentication-service:
    image: ghcr.io/a-novel/service-authentication/standalone:v1
    depends_on:
      authentication-postgres:
        condition: service_started
      json-keys-service:
        condition: service_started
    environment:
      POSTGRES_DSN: postgres://postgres:postgres@authentication-postgres:5432/authentication?sslmode=disable
      JSON_KEYS_SERVICE_URL: http://json-keys-service:8080/v1
      # Make sure the value below matches the port of the platform.
      AUTH_PLATFORM_URL: http://localhost:6001
      DEBUG: true
    networks:
      - api

  # ================================================================================
  # Platform Authentication.
  # Access it in your browser: http://localhost:6001
  # ================================================================================
  platform-authentication:
    image: ghcr.io/a-novel/platform-authentication/platform:v1
    depends_on:
      authentication-service:
        condition: service_started
    ports:
      - "6001:8080"
    environment:
      VITE_SERVICE_AUTH_URL: http://authentication-service:8080/v1
      # Official CDN for the Tolgee translations of Agora.
      VITE_TOLGEE_CDN: https://cdn.tolg.ee/74c1bb8828074430ae95b462ab95374b
      # Links to external Agora applications.
      VITE_PLATFORM_STUDIO_URL: https://localhost:6011
    networks:
      - api

networks:
  api:

volumes:
  json-keys-postgres-data:
  authentication-postgres-data:
```
