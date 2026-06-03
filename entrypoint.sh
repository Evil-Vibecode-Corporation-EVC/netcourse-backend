#!/bin/sh
set -e
echo "Running migrations..."
node dist/migrate.js
echo "Starting server..."
exec node dist/server.js
