#!/bin/sh
set -e

echo "🚀 Starting Pedidos service..."
exec node dist/main.js
