#!/bin/bash

# Script para alternar entre entorno de desarrollo local y producción

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo "ClinvetIA - Environment Switcher"
    echo ""
    echo "Uso:"
    echo "  ./scripts/switch-env.sh local    -> Cambiar a desarrollo local"
    echo "  ./scripts/switch-env.sh prod     -> Cambiar a producción (⚠️  Cuidado)"
    echo "  ./scripts/switch-env.sh status   -> Ver entorno actual"
    echo ""
}

switch_to_local() {
    echo -e "${BLUE}🔄 Cambiando a entorno LOCAL...${NC}"
    
    if [ -f ".env.local.backup" ]; then
        if [ -f ".env.local" ]; then
            # Verificar si actualmente es producción
            if grep -q "ep-withered-dawn" ".env.local" 2>/dev/null; then
                mv ".env.local" ".env.local.backup.prod"
                echo -e "${GREEN}✅ Backup de producción guardado${NC}"
            fi
        fi
    fi
    
    if [ -f ".env.local.backup" ]; then
        mv ".env.local.backup" ".env.local"
        echo -e "${GREEN}✅ Restaurado .env.local (desarrollo)${NC}"
    else
        cp ".env.local.dev" ".env.local"
        echo -e "${GREEN}✅ Creado .env.local desde plantilla${NC}"
    fi
    
    # Iniciar Docker si no está corriendo
    if ! docker ps | grep -q "clinvetia-postgres"; then
        echo -e "${BLUE}🐳 Iniciando PostgreSQL...${NC}"
        npm run db:start
        echo -e "${YELLOW}⏳ Espera 5 segundos a que la base de datos esté lista...${NC}"
        sleep 5
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Entorno LOCAL activado!${NC}"
    echo ""
    echo -e "${BLUE}📊 Base de datos:${NC} Local (Docker)"
    echo -e "${BLUE}🔐 Admin:${NC} http://localhost:3000/admin/login"
    echo -e "${BLUE}👤 Usuario:${NC} superadmin"
    echo -e "${BLUE}🔑 Contraseña:${NC} ClinvetIA-SuperAdmin-2026!"
    echo ""
    echo "Ejecuta: npm run dev"
}

switch_to_prod() {
    echo -e "${RED}⚠️  ATENCIÓN: Estás cambiando a PRODUCCIÓN${NC}"
    echo ""
    echo "Esto conectará con la base de datos REAL de Neon."
    echo "Las reservas que veas serán las de los clientes reales."
    echo ""
    
    read -p "¿Estás seguro? (escribe 'produccion' para confirmar): " confirm
    
    if [ "$confirm" != "produccion" ]; then
        echo -e "${YELLOW}❌ Cancelado${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}🔄 Cambiando a PRODUCCIÓN...${NC}"
    
    # Guardar el local actual
    if [ -f ".env.local" ]; then
        mv ".env.local" ".env.local.backup"
        echo -e "${GREEN}✅ Backup de desarrollo guardado${NC}"
    fi
    
    # Restaurar producción
    if [ -f ".env.local.backup.prod" ]; then
        mv ".env.local.backup.prod" ".env.local"
        echo -e "${GREEN}✅ Restaurado .env.local (producción)${NC}"
    else
        echo -e "${RED}❌ No se encontró backup de producción${NC}"
        echo "   Busca tu archivo .env.local original con las credenciales de Neon"
        exit 1
    fi
    
    # Detener Docker local
    if docker ps | grep -q "clinvetia-postgres"; then
        echo -e "${BLUE}🛑 Deteniendo PostgreSQL local...${NC}"
        npm run db:stop
    fi
    
    echo ""
    echo -e "${RED}🚨 Entorno PRODUCCIÓN activado!${NC}"
    echo ""
    echo -e "${RED}⚠️  TEN CUIDADO:${NC}"
    echo "   • Estás viendo datos REALES de clientes"
    echo "   • NO hagas pruebas ni modifiques reservas"
    echo "   • Solo para consultas de solo lectura"
    echo ""
}

show_status() {
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}⚠️  No hay .env.local configurado${NC}"
        exit 1
    fi
    
    if grep -q "clinvetia_dev" ".env.local" 2>/dev/null; then
        echo -e "${GREEN}🟢 Entorno actual: LOCAL (Desarrollo)${NC}"
        echo ""
        echo "Base de datos: PostgreSQL local (Docker)"
        echo "URL: http://localhost:3000"
        
        if docker ps | grep -q "clinvetia-postgres"; then
            echo -e "${GREEN}Estado Docker: Corriendo${NC}"
        else
            echo -e "${RED}Estado Docker: Detenido${NC}"
        fi
    elif grep -q "ep-withered-dawn" ".env.local" 2>/dev/null; then
        echo -e "${RED}🔴 Entorno actual: PRODUCCIÓN${NC}"
        echo ""
        echo "⚠️  ATENCIÓN: Estás conectado a la base de datos de Neon"
        echo "Base de datos: PostgreSQL en Neon (Producción)"
        echo "URL: https://clinvetia.com"
    else
        echo -e "${YELLOW}🟡 Entorno actual: Desconocido${NC}"
        echo "No se pudo determinar el entorno desde .env.local"
    fi
}

# Main
case "${1:-status}" in
    local|dev|desarrollo)
        switch_to_local
        ;;
    prod|produccion|production)
        switch_to_prod
        ;;
    status|estado)
        show_status
        ;;
    help|h|--help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Opción no válida: $1${NC}"
        show_help
        exit 1
        ;;
esac
