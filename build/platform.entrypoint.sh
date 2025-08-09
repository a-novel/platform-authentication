#!/bin/bash

set -e

# Interpolate runtime environment variables.
bash /usr/local/bin/env.sh "/.output" "/.tanstack"

# Execute the original entrypoint script
exec /usr/local/bin/docker-entrypoint.sh "$@"
