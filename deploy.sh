#!/bin/bash
# ============================================================
#  deploy.sh - Script de despliegue Gestión FCT
#  Puerto: 3050
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎓 Gestión FCT - Deploy Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está disponible"
    exit 1
fi

echo "✓ Docker encontrado: $(docker --version)"
echo "✓ Docker Compose: $(docker compose version --short)"
echo ""

# Verificar que el puerto 3050 está libre
if ss -tulnp 2>/dev/null | grep -q ':3050 '; then
    echo "⚠️  El puerto 3050 está en uso. Comprueba qué proceso lo ocupa:"
    ss -tulnp | grep ':3050'
    echo ""
    read -p "¿Continuar de todas formas? (s/N): " -n 1 -r
    echo ""
    [[ ! $REPLY =~ ^[Ss]$ ]] && exit 1
fi

# Parar contenedores anteriores si existen
echo "🛑 Parando contenedores existentes..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# Build e inicio
echo ""
echo "🔨 Construyendo imágenes (puede tardar varios minutos la primera vez)..."
docker compose -f "$COMPOSE_FILE" build --no-cache

echo ""
echo "🚀 Iniciando servicios..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 5

# Verificar que están corriendo
MAX_TRIES=30
COUNT=0
echo -n "   Esperando backend..."
while [ $COUNT -lt $MAX_TRIES ]; do
    if curl -sf http://localhost:3050/api/health > /dev/null 2>&1; then
        echo " ✓"
        break
    fi
    echo -n "."
    sleep 3
    COUNT=$((COUNT + 1))
done

if [ $COUNT -eq $MAX_TRIES ]; then
    echo ""
    echo "⚠️  El backend tardó más de lo esperado. Comprueba los logs:"
    echo "   docker compose logs backend"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Gestión FCT desplegado correctamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Obtener IP local
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "  🌐 Acceso local:   http://localhost:3050"
echo "  🌐 Acceso red:     http://$LOCAL_IP:3050"
echo ""
echo "  👤 Admin:     admin@fct.edu"
echo "  🔑 Password:  admin123"
echo ""
echo "  Comandos útiles:"
echo "  📋 Ver logs:         docker compose logs -f"
echo "  🛑 Parar:            docker compose down"
echo "  🔄 Reiniciar:        docker compose restart"
echo "  💾 Ver BD:           docker compose exec postgres psql -U fct_user -d gestion_fct"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"