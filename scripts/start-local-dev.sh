#!/bin/bash

# Script para iniciar el entorno de desarrollo local

echo "🚀 Iniciando entorno de desarrollo ClinvetIA..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instálalo."
    exit 1
fi

# Crear directorio para inicialización si no existe
mkdir -p docker/postgres/init

# Verificar si el contenedor ya está corriendo
if docker ps | grep -q clinvetia-postgres; then
    echo "✅ Base de datos PostgreSQL ya está corriendo"
else
    echo "🐳 Iniciando PostgreSQL con Docker..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Esperar a que PostgreSQL esté listo
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    sleep 5
    
    # Verificar conexión
    until docker exec clinvetia-postgres pg_isready -U clinvetia -d clinvetia_dev > /dev/null 2>&1; do
        echo "   Esperando conexión..."
        sleep 2
    done
    
    echo "✅ PostgreSQL está listo!"
fi

# Configurar variables de entorno para desarrollo
export DATABASE_URL="postgresql://clinvetia:clinvetia_local_dev@localhost:5432/clinvetia_dev?schema=public"
export DATABASE_URL_UNPOOLED="postgresql://clinvetia:clinvetia_local_dev@localhost:5432/clinvetia_dev?schema=public"
export ADMIN_SESSION_SECRET="local-dev-secret-32-chars-long-for-testing"
export ADMIN_BOOTSTRAP_USERNAME="superadmin"
export ADMIN_BOOTSTRAP_PASSWORD="ClinvetIA-SuperAdmin-2026!"
export ADMIN_BOOTSTRAP_EMAIL="admin@clinvetia.local"
export APP_URL="http://localhost:3000"
export EMAIL_ENABLED="false"
export NODE_ENV="development"

echo ""
echo "📊 Configuración de base de datos local:"
echo "   Host: localhost:5432"
echo "   Base de datos: clinvetia_dev"
echo "   Usuario: clinvetia"
echo "   Contraseña: clinvetia_local_dev"
echo ""
echo "👤 Super Admin:"
echo "   Usuario: superadmin"
echo "   Contraseña: ClinvetIA-SuperAdmin-2026!"
echo ""
echo "🔧 Para aplicar migraciones y crear el super admin, ejecuta:"
echo "   npm run db:setup"
echo ""
echo "🌐 Adminer (gestor de BD) disponible en: http://localhost:8080"
echo ""
echo "✨ Entorno listo! Ahora puedes iniciar la app con: npm run dev"
