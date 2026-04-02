#!/bin/bash

set -e

APP_NAME="auth-translations"

EXEC_CMD=""

if [ "$IS_CI" == "true" ]
then
    EXEC_CMD="docker exec ${APP_NAME}-tolgee-db-1"
else
    EXEC_CMD="podman exec ${APP_NAME}_tolgee-db_1"
fi

$EXEC_CMD psql -U postgres -d postgres -c "DELETE FROM public.activity_describing_entity;"
$EXEC_CMD psql -U postgres -d postgres -c "DELETE FROM public.activity_modified_entity;"
$EXEC_CMD psql -U postgres -d postgres -c "DELETE FROM public.activity_revision;"
$EXEC_CMD pg_dump -U postgres --clean --if-exists --role=postgres postgres > builds/tolgee.database.dump
