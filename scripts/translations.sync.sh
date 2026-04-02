#!/bin/bash

set -e

PLATFORM=""
SHARED=""

ACTION=""

while test $# -gt 0; do
  case "$1" in
    -p*|--package*)
      TARGET="$(echo "$1" | sed -e 's/^[^=]*=//g')"
      if [ "$TARGET" == "platform" ]; then PLATFORM="true"; fi
      if [ "$TARGET" == "shared" ]; then SHARED="true"; fi
      shift
      ;;
    -a*|--action*)
      ACTION="$(echo "$1" | sed -e 's/^[^=]*=//g')"
      shift
      ;;
    *)
      break
      ;;
  esac
done

APP_NAME="auth-translations"

# Retrieve tolgee port from running pods.
TOLGEE_PORT="$(podman port "${APP_NAME}_tolgee-app_1" 8080 | sed -e 's/^[^:]*://g')"

export TOLGEE_PKG_API_KEY="tgpak_gjpwu5dgoiyw65lvoqydqndknrtwi5lmmzuw6yrwhfwda"
export TOLGEE_PLATFORM_API_KEY="tgpak_gfptk4tiob2ds23thb2damtwmm2w23bzmuzte43tnvygk"
export TOLGEE_URL=${TOLGEE_URL:="http://localhost:${TOLGEE_PORT}"}

runAction() {
  if [ "$ACTION" == "push" ]; then
    echo "Pushing translations to $1 project"
    pnpm --dir "$1" run translations:push
  elif [ "$ACTION" == "generate" ]; then
    echo "Generating translations for $1 project"
    pnpm run --dir "$1" generate
  elif [ "$ACTION" == "check" ]; then
    echo "Checking translations for $1 project"
    pnpm run --dir "$1" generate:check
  fi
}

if [ "$PLATFORM" == "true" ]; then runAction "$PWD/packages/platform"; fi
if [ "$SHARED" == "true" ]; then runAction "$PWD/packages/shared"; fi
