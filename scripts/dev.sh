#!/bin/bash

APP_NAME="platform-authentication"
PODMAN_FILE="$PWD/build/podman-compose.yaml"

# Ensure containers are properly shut down when the program exits abnormally.
int_handler()
{
    podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down
}
trap int_handler INT

# Setup test containers.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" up -d --pull-always

# shellcheck disable=SC2046
pnpm run dev:ci

# Normal execution: containers are shut down.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down
