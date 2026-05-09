#!/bin/sh
set -e

echo ">>> Pushing schema to database..."
npx drizzle-kit push

echo ">>> Seeding default account..."
node dist/db/seed.js

echo ">>> Starting server..."
exec node dist/index.js
