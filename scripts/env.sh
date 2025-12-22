#!/bin/bash

# Script to inject static environment variables in svelte build at runtime.
# Svelte allows to import environment variables either statically or dynamically, the later coming with optimization
# caveats - public variables have to be sent over http to the client.
#
# we build the application within the docker image directly. With this workflow, we cannot use static environment
# variables unless we know them when building the docker image itself. However, the pattern we seek is for env
# to be set when mounting the Docker image (aka after the build phase but before the container is running).
#
# By default svelte would require us to use dynamic variables (since the client is already built), but we use this
# script as a little hack to interpolate static environment variables at, technically, runtime (while mounting the
# container).
#
# To interpolate a variable on mount, simply populate it statically with the `RUNTIME_` prefix
# (eg: MY_VAR="RUNTIME_MY_VAR"). This lets the script know another value is expected, and since this should run as
# part of the entrypoint, our values should be properly updated before running the node server.

set -e

# Check that at least one argument is provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path1> [path2 ...]"
    exit 1
fi

# Loop over each argument
for path in "$@"; do
    # Check if path exists
    if [ ! -e "$path" ]; then
        echo "Error: '$path' does not exist."
        exit 1
    fi

    # Build the list of files to process
    if [ -d "$path" ]; then
        files=$(find "$path" -type f)
    else
        files="$path"
    fi

    while IFS= read -r file; do
        # Skip binary files
        if grep -Iq . "$file"; then
            # Find all placeholders
            matches=$(grep -oE 'RUNTIME_VITE_[A-Za-z0-9_]+' "$file" || true)

            for match in $matches; do
                var_name="${match#RUNTIME_VITE_}"
                env_var="VITE_${var_name}"

                value="${!env_var}"
                sed -i "s|$match|$value|g" "$file"
            done
        fi
    done <<< "$files"
done
