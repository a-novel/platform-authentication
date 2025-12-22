#!/bin/bash

set -e

dumpCmd="pg_dump -U postgres --clean --if-exists --role=postgres postgres"

APP_NAME="auth-translations"

if [ "$IS_CI" == "true" ]
then
    docker exec "${APP_NAME}"-tolgee-db-1 $dumpCmd > builds/tolgee.database.dump
else
    podman exec "${APP_NAME}"_tolgee-db_1 $dumpCmd > builds/tolgee.database.dump
fi
