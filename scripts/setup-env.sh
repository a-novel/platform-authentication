#!/bin/bash

PLATFORM_PORT="${PLATFORM_PORT:="$(node -e 'console.log(await (await import("get-port-please")).getRandomPort())')"}"
export PLATFORM_PORT
printf "Exposing platform on port %s\n" "${PLATFORM_PORT}"
SERVICE_AUTHENTICATION_PORT="${SERVICE_AUTHENTICATION_PORT:="$(node -e 'console.log(await (await import("get-port-please")).getRandomPort())')"}"
export SERVICE_AUTHENTICATION_PORT
MAIL_UI_PORT="${MAIL_UI_PORT:="$(node -e 'console.log(await (await import("get-port-please")).getRandomPort())')"}"
export MAIL_UI_PORT
TOLGEE_PORT="${TOLGEE_PORT:="$(node -e 'console.log(await (await import("get-port-please")).getRandomPort())')"}"
export TOLGEE_PORT

export PLATFORM_URL="${PLATFORM_URL:="http://localhost:${PLATFORM_PORT}"}"
export MAIL_HOST=${MAIL_HOST:="http://localhost:${MAIL_UI_PORT}"}
export SERVICE_AUTHENTICATION_URL=${SERVICE_AUTHENTICATION_URL:="http://localhost:${SERVICE_AUTHENTICATION_PORT}"}
