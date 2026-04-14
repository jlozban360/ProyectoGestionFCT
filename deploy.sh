#!/bin/bash
# ============================================================
#  deploy.sh - Script de despliegue Gestión FCT
#  Puerto: 3050
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Gestion FCT - Deploy Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no esta instalado"
    exit 1
fi
if ! docker compose version &> /dev/null; then
    echo "ERROR: Docker Compose no esta disponible"
    exit 1
fi

echo "✓ Docker: $(docker --version)"
echo "✓ Compose: $(docker compose version --short)"
echo ""

# Verificar puerto 3050
if ss -tulnp 2>/dev/null | grep -q ':3050 '; then
    echo "AVISO: El puerto 3050 esta en uso:"
    ss -tulnp | grep ':3050'
    echo ""
    read -p "Continuar de todas formas? (s/N): " -n 1 -r
    echo ""
    [[ ! $REPLY =~ ^[Ss]$ ]] && exit 1
fi

# Parar contenedores anteriores
echo "Parando contenedores existentes..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# Build
echo ""
echo "Construyendo imagenes..."
docker compose -f "$COMPOSE_FILE" build --no-cache

# Arranque
echo ""
echo "Iniciando servicios..."
docker compose -f "$COMPOSE_FILE" up -d

# Esperar health
echo ""
MAX_TRIES=20
COUNT=0
echo -n "Esperando backend..."
while [ $COUNT -lt $MAX_TRIES ]; do
    if curl -sf http://localhost:3050/api/health > /dev/null 2>&1; then
        echo " OK"
        break
    fi
    echo -n "."
    sleep 3
    COUNT=$((COUNT + 1))
done

if [ $COUNT -eq $MAX_TRIES ]; then
    echo ""
    echo "AVISO: El backend tardo mas de lo esperado. Revisa los logs:"
    echo "   docker compose logs -f fct_backend"
    exit 1
fi

# Resumen
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Gestion FCT desplegado correctamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Acceso local:   http://localhost:3050"
echo "  Acceso red:     http://$LOCAL_IP:3050"
echo "  Health check:   http://localhost:3050/api/health"
echo ""
echo "  Admin:     admin@fct.edu"
echo "  Password:  admin123"
echo ""
echo "  Comandos utiles:"
echo "  Ver logs:        docker compose logs -f"
echo "  Logs backend:    docker compose logs -f fct_backend"
echo "  Parar:           docker compose down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
