#!/bin/bash

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
