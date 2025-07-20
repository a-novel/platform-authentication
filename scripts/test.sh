#!/bin/bash

APP_NAME="platform-authentication-test"
PODMAN_FILE="$PWD/build/podman-compose.test.yaml"

# Ensure containers are properly shut down when the program exits abnormally.
int_handler()
{
    podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down --volume
}
trap int_handler INT

# Setup test containers.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" up -d --pull-always

rm -rf "$PWD/__test__/screenshots"

# shellcheck disable=SC2046
pnpm run test:base:e2e

# Normal execution: containers are shut down.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down --volume
