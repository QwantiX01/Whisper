#!/bin/sh
set -euo pipefail

if [ ! -d node_modules ] || [ ! -d node_modules/.prisma ]; then
  echo "Installing dependencies with Bun..."
  bun install
else
  echo "node_modules already present; skipping bun install"
fi

echo "Generating Prisma client..."
bunx prisma generate

echo "Starting Next.js dev server with Bun"
exec bun run dev --hostname 0.0.0.0
