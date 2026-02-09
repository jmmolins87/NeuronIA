#!/bin/bash

# Script para resetear la base de datos local y recrear todo desde cero
# Útil cuando hay problemas con las migraciones

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ClinvetIA - Reset de Base de Datos Local               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${YELLOW}⚠️  ATENCIÓN: Esto eliminará TODOS los datos de la base de datos local${NC}"
echo ""
read -p "¿Estás seguro? Escribe 'resetear' para confirmar: " confirm

if [ "$confirm" != "resetear" ]; then
    echo -e "${YELLOW}❌ Cancelado${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🗄️  Reseteando base de datos...${NC}"

# 1. Detener contenedor si existe
if docker ps -a | grep -q "clinvetia-postgres"; then
    echo -e "${BLUE}   Deteniendo contenedor...${NC}"
    docker stop clinvetia-postgres >/dev/null 2>&1 || true
    docker rm clinvetia-postgres >/dev/null 2>&1 || true
    echo -e "${GREEN}   ✅ Contenedor eliminado${NC}"
fi

# 2. Eliminar volumen
docker volume rm clinvetia-app_postgres_data >/dev/null 2>&1 || true
echo -e "${GREEN}   ✅ Volumen eliminado${NC}"

# 3. Recrear contenedor
echo -e "${BLUE}   Creando nuevo contenedor...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# 4. Esperar a PostgreSQL
echo -e "${BLUE}   Esperando a PostgreSQL...${NC}"
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
until docker exec clinvetia-postgres pg_isready -U clinvetia -d clinvetia_dev > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ PostgreSQL no respondió${NC}"
        exit 1
    fi
    echo -n "."
    sleep 2
done
echo ""

# 5. Aplicar esquema
echo -e "${BLUE}   Aplicando esquema...${NC}"
npx prisma db push --accept-data-loss

# 6. Generar cliente
echo -e "${BLUE}   Generando Prisma Client...${NC}"
npx prisma generate

# 7. Crear super admin
echo -e "${BLUE}   Creando super admin...${NC}"
npx tsx scripts/create-super-admin.ts

echo ""
echo -e "${GREEN}✅ Base de datos reseteada y configurada!${NC}"
echo ""
echo -e "${BLUE}Credenciales:${NC}"
echo "   Usuario: superadmin"
echo "   Contraseña: ClinvetIA-SuperAdmin-2026!"
echo ""
echo "Ejecuta: npm run dev"
