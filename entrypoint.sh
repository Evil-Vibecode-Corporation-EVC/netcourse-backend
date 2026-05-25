#!/bin/sh
echo "Running migrations..."
node dist/migrate.js || echo "Migration failed, continuing..."
echo "Starting server..."
exec node dist/server.js
