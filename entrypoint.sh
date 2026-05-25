#!/bin/sh
echo "Running migrations..."
npm run migrate
echo "Starting server..."
exec node dist/server.js
