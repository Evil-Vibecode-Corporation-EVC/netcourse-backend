#!/bin/sh
set -e
echo "Running migrations..."
pnpm migrate
echo "Starting server..."
exec node dist/server.js
