#!/bin/sh
set -e

echo "🚀 Starting Inventario service..."
exec node dist/main.js
