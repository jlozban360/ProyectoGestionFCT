#!/bin/bash
# ============================================================
#  deploy.sh - Script de despliegue Gestión FCT
#  Puerto: 3050
#  Uso: ./deploy.sh [spring|node]
#       Si no se pasa argumento, usa COMPOSE_PROFILES del .env
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env"

# ── Determinar qué backend desplegar ─────────────────────────
if [[ -n "$1" ]]; then
    PROFILE="$1"
    # Actualizar .env para que quede persistido
    if grep -q "^COMPOSE_PROFILES=" "$ENV_FILE" 2>/dev/null; then
        sed -i "s/^COMPOSE_PROFILES=.*/COMPOSE_PROFILES=$PROFILE/" "$ENV_FILE"
    else
        echo "COMPOSE_PROFILES=$PROFILE" >> "$ENV_FILE"
    fi
elif [[ -f "$ENV_FILE" ]]; then
    PROFILE=$(grep "^COMPOSE_PROFILES=" "$ENV_FILE" | cut -d= -f2 | tr -d '[:space:]')
fi

if [[ "$PROFILE" != "spring" && "$PROFILE" != "node" ]]; then
    echo "ERROR: backend no reconocido: '$PROFILE'"
    echo "Uso: $0 [spring|node]"
    exit 1
fi

# ── Cabecera ──────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Gestion FCT - Deploy Script"
echo "  Backend: $PROFILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Verificar Docker ──────────────────────────────────────────
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

# ── Verificar puerto 3050 ─────────────────────────────────────
if ss -tulnp 2>/dev/null | grep -q ':3050 '; then
    echo "AVISO: El puerto 3050 esta en uso:"
    ss -tulnp | grep ':3050'
    echo ""
    read -p "Continuar de todas formas? (s/N): " -n 1 -r
    echo ""
    [[ ! $REPLY =~ ^[Ss]$ ]] && exit 1
fi

# ── Parar contenedores anteriores ────────────────────────────
echo "Parando contenedores existentes..."
docker compose -f "$COMPOSE_FILE" --profile spring --profile node down --remove-orphans 2>/dev/null || true

# ── Build ─────────────────────────────────────────────────────
echo ""
echo "Construyendo imagenes (puede tardar varios minutos la primera vez)..."
docker compose -f "$COMPOSE_FILE" --profile "$PROFILE" build --no-cache

# ── Arranque ──────────────────────────────────────────────────
echo ""
echo "Iniciando servicios (perfil: $PROFILE)..."
docker compose -f "$COMPOSE_FILE" --profile "$PROFILE" up -d

# ── Esperar health ────────────────────────────────────────────
echo ""
echo "Esperando a que los servicios esten listos..."

if [[ "$PROFILE" == "spring" ]]; then
    MAX_TRIES=40   # Spring tarda más en arrancar
else
    MAX_TRIES=20
fi

COUNT=0
echo -n "   Esperando backend ($PROFILE)..."
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

# ── Resumen ───────────────────────────────────────────────────
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Gestion FCT desplegado correctamente"
echo "  Backend activo: $PROFILE"
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
echo "  Cambiar backend: ./switch-backend.sh [spring|node]"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
