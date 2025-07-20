#!/bin/bash

APP_NAME="platform-authentication"
PODMAN_FILE="$PWD/build/podman-compose.yaml"

# Ensure containers are properly shut down when the program exits abnormally.
int_handler()
{
    podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down
}
trap int_handler INT

pnpm run build

# Setup test containers.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" up -d --pull-always

# shellcheck disable=SC2046
PORT=${VITE_SERVER_PORT} pnpm run start:ci

# Normal execution: containers are shut down.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down
