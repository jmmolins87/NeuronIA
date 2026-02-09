#!/bin/bash

# Setup completo para desarrollo local de ClinvetIA
# Este script configura todo automáticamente para trabajar en local

set -e  # Detener en caso de error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ClinvetIA - Setup de Desarrollo Local                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==========================================
# 1. VERIFICAR DEPENDENCIAS
# ==========================================
echo -e "${BLUE}🔍 Verificando dependencias...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "   Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "   Instala Node.js 25.5.0 desde: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Node.js encontrados${NC}"

# ==========================================
# 2. BACKUP DE CONFIGURACIÓN ACTUAL
# ==========================================
echo ""
echo -e "${BLUE}💾 Creando backup de configuración actual...${NC}"

# Backup del .env (producción) si existe y no es local
if [ -f ".env" ]; then
    if ! grep -q "clinvetia_dev" ".env" 2>/dev/null; then
        mv ".env" ".env.backup.prod"
        echo -e "${GREEN}✅ Backup de .env (producción) creado${NC}"
    else
        rm -f ".env"
        echo -e "${YELLOW}⚠️  Eliminado .env con configuración local${NC}"
    fi
fi

if [ -f ".env.local" ]; then
    # Verificar si ya es el archivo de desarrollo
    if grep -q "clinvetia_dev" ".env.local"; then
        echo -e "${YELLOW}⚠️  Ya estás usando configuración de desarrollo${NC}"
    else
        mv ".env.local" ".env.local.backup"
        echo -e "${GREEN}✅ Backup creado: .env.local.backup${NC}"
        echo -e "   ${YELLOW}(Contiene tu configuración de producción)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No existe .env.local actual${NC}"
fi

# ==========================================
# 3. COPIAR CONFIGURACIÓN DE DESARROLLO
# ==========================================
echo ""
echo -e "${BLUE}📝 Configurando entorno de desarrollo...${NC}"

if [ ! -f ".env.local.dev" ]; then
    echo -e "${RED}❌ No existe .env.local.dev${NC}"
    echo "   Asegúrate de tener el archivo de configuración de desarrollo"
    exit 1
fi

cp ".env.local.dev" ".env.local"
echo -e "${GREEN}✅ Configuración de desarrollo aplicada${NC}"

# ==========================================
# 4. INICIAR DOCKER
# ==========================================
echo ""
echo -e "${BLUE}🐳 Iniciando PostgreSQL con Docker...${NC}"

# Verificar si Docker daemon está corriendo
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon no está corriendo${NC}"
    echo "   Inicia Docker Desktop o el servicio de Docker"
    exit 1
fi

# Verificar si ya existe el contenedor
if docker ps -a | grep -q "clinvetia-postgres"; then
    if docker ps | grep -q "clinvetia-postgres"; then
        echo -e "${YELLOW}⚠️  PostgreSQL ya está corriendo${NC}"
    else
        echo -e "${BLUE}🔄 Reiniciando contenedor existente...${NC}"
        docker start clinvetia-postgres
    fi
else
    echo -e "${BLUE}📦 Creando nuevo contenedor...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
fi

# ==========================================
# 5. ESPERAR A POSTGRESQL
# ==========================================
echo ""
echo -e "${BLUE}⏳ Esperando a que PostgreSQL esté listo...${NC}"

MAX_RETRIES=30
RETRY_COUNT=0

until docker exec clinvetia-postgres pg_isready -U clinvetia -d clinvetia_dev > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ PostgreSQL no respondió después de 60 segundos${NC}"
        echo "   Verifica los logs: docker logs clinvetia-postgres"
        exit 1
    fi
    echo -n "."
    sleep 2
done

echo ""
echo -e "${GREEN}✅ PostgreSQL está listo!${NC}"

# ==========================================
# 6. INSTALAR DEPENDENCIAS
# ==========================================
echo ""
echo -e "${BLUE}📦 Instalando dependencias...${NC}"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules ya existe (omitido)${NC}"
fi

# ==========================================
# 7. GENERAR PRISMA CLIENT
# ==========================================
echo ""
echo -e "${BLUE}🔧 Generando Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generado${NC}"

# ==========================================
# 7. APLICAR ESQUEMA
# ==========================================
echo ""
echo -e "${BLUE}🗄️  Aplicando esquema de base de datos...${NC}"

# Forzar el uso de las variables de entorno locales
export DATABASE_URL="$DATABASE_URL_UNPOOLED"
npx prisma db push --accept-data-loss

echo -e "${GREEN}✅ Esquema de base de datos aplicado${NC}"

# ==========================================
# 9. CREAR SUPER ADMIN
# ==========================================
echo ""
echo -e "${BLUE}👤 Creando super admin...${NC}"

# Verificar si ya existe el superadmin (con manejo de errores)
SUPERADMIN_EXISTS=0
if docker exec clinvetia-postgres psql -U clinvetia -d clinvetia_dev -tAc "SELECT COUNT(*) FROM \"AdminUser\" WHERE username = 'superadmin';" 2>/dev/null | grep -q "1"; then
    SUPERADMIN_EXISTS=1
fi

if [ "$SUPERADMIN_EXISTS" -eq "1" ]; then
    echo -e "${YELLOW}⚠️  Super admin ya existe (omitido)${NC}"
else
    npx tsx scripts/create-super-admin.ts
    echo -e "${GREEN}✅ Super admin creado${NC}"
fi

# ==========================================
# 10. RESUMEN
# ==========================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ✅ Setup Completado!                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🌐 Aplicación:${NC} http://localhost:3000"
echo -e "${GREEN}🔐 Admin Login:${NC} http://localhost:3000/admin/login"
echo -e "${GREEN}🗄️  Adminer:${NC} http://localhost:8080"
echo ""
echo -e "${YELLOW}👤 Credenciales Super Admin:${NC}"
echo "   Usuario: superadmin"
echo "   Contraseña: ClinvetIA-SuperAdmin-2026!"
echo ""
echo -e "${BLUE}📊 Base de datos local:${NC}"
echo "   Host: localhost:5432"
echo "   Database: clinvetia_dev"
echo "   User: clinvetia"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   • Estás trabajando en LOCAL (no toca producción)"
echo "   • Las reservas son independientes de las de producción"
echo "   • Para volver a producción: mv .env.local.backup .env.local"
echo ""
echo -e "${GREEN}🚀 Iniciando servidor de desarrollo...${NC}"
echo ""

# ==========================================
# 11. INICIAR SERVIDOR
# ==========================================
npm run dev
