#!/bin/bash

set -e

# This script builds all the local dockerfiles under the ":local" tag.

podman build --format docker \
  --secret id=npmrc,src="${NPMRC_PATH:-$HOME/.npmrc}" \
  -f ./builds/platform.Dockerfile \
  -t ghcr.io/a-novel/platform-authentication/platform:local .
