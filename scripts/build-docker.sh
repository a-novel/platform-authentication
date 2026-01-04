#!/bin/bash

set -e

# This script builds all the local dockerfiles under the ":local" tag.

podman build --format docker \
  -f ./builds/platform.Dockerfile \
  -t ghcr.io/a-novel/platform-authentication/platform:local .
