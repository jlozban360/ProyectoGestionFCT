#!/bin/bash
# Cambia entre backend Spring Boot y Node.js
# Uso: ./switch-backend.sh [spring|node]

set -e

BACKEND="${1:-}"
ENV_FILE=".env"

if [[ "$BACKEND" != "spring" && "$BACKEND" != "node" ]]; then
  # Detectar cuál está activo ahora
  CURRENT=$(grep COMPOSE_PROFILES "$ENV_FILE" | cut -d= -f2 | tr -d '[:space:]')
  echo "Backend actual: $CURRENT"
  echo ""
  echo "Uso: $0 [spring|node]"
  echo "  spring  → Spring Boot (Java 21)"
  echo "  node    → Node.js (Express)"
  exit 1
fi

echo "▶ Cambiando a backend: $BACKEND"

# Actualizar .env
if grep -q "^COMPOSE_PROFILES=" "$ENV_FILE"; then
  sed -i "s/^COMPOSE_PROFILES=.*/COMPOSE_PROFILES=$BACKEND/" "$ENV_FILE"
else
  echo "COMPOSE_PROFILES=$BACKEND" >> "$ENV_FILE"
fi

echo "✓ .env actualizado"

# Detener contenedor de backend anterior (si existe)
docker stop fct_backend 2>/dev/null && docker rm fct_backend 2>/dev/null || true

echo "▶ Levantando backend $BACKEND..."
docker compose --profile "$BACKEND" up -d --build

echo ""
echo "✓ Backend $BACKEND activo en http://localhost:3050"
echo "  Health: http://localhost:3050/api/health"
