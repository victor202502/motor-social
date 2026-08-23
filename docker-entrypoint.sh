#!/bin/bash
set -e

echo ">>> Inicializando PostgreSQL..."
if [ -z "$(ls -A /var/lib/postgresql/data)" ]; then
    su-exec postgres initdb -D /var/lib/postgresql/data
fi

echo ">>> Arrancando PostgreSQL en background..."
su-exec postgres pg_ctl start -D /var/lib/postgresql/data -l /var/lib/postgresql/logfile

# Esperar a que la BBDD esté lista
until su-exec postgres pg_isready; do sleep 1; done

echo ">>> Configurando BD y usuario..."
su-exec postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'admin'" | grep -q 1 || \
    su-exec postgres psql -c "CREATE USER admin WITH SUPERUSER PASSWORD 'password123';"

su-exec postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'motor_social_db'" | grep -q 1 || \
    su-exec postgres psql -c "CREATE DATABASE motor_social_db OWNER admin;"

# Importar las tablas si la base de datos está recién creada
TABLE_COUNT=$(su-exec postgres psql -d motor_social_db -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
if [ "$TABLE_COUNT" -eq "0" ] && [ -f "/app/schema.sql" ]; then
    echo ">>> Importando tablas..."
    su-exec postgres psql -d motor_social_db -f /app/schema.sql
fi

echo ">>> Arrancando Express Backend..."
# Forzar las variables locales
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_USER=admin
export DB_PASSWORD=password123
export DB_NAME=motor_social_db
export JWT_SECRET=${JWT_SECRET:-"super_secreto_demo_123"}

exec node src/index.js
