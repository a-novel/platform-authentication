#!/bin/bash

set -e

APP_NAME="auth-translations"
PODMAN_FILE="$PWD/builds/podman-compose.tolgee.yaml"

# Ensure containers are properly shut down when the program exits abnormally.
int_handler()
{
    podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down --volume
}
trap int_handler INT TERM QUIT HUP

podman compose --podman-build-args="--format docker -q" -p "${APP_NAME}" -f "${PODMAN_FILE}" up --build

# Normal execution: containers are shut down.
podman compose -p "${APP_NAME}" -f "${PODMAN_FILE}" down --volume
