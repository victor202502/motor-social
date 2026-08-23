#!/bin/bash
# Recolecta en un solo .txt los archivos necesarios para revisar la
# configuración de entorno (local + AWS) de motor-social.
# Ejecutar desde la raíz del proyecto (donde está docker-compose.yml),
# con Git Bash o WSL:  bash recolectar_contexto.sh

if [ ! -f "docker-compose.yml" ]; then
    echo "No encuentro docker-compose.yml aquí. Ejecuta esto desde la raíz del proyecto (motor-social/)."
    exit 1
fi

OUTPUT="contexto_env.txt"
> "$OUTPUT"

add_file() {
    if [ -f "$1" ]; then
        {
            echo "===== $1 ====="
            cat "$1"
            echo ""
            echo ""
        } >> "$OUTPUT"
    else
        echo "===== $1 (no existe) =====" >> "$OUTPUT"
        echo "" >> "$OUTPUT"
    fi
}

echo "Recolectando..."

# Orquestación / despliegue
add_file "docker-compose.yml"
add_file "docker-entrypoint.sh"
add_file "Dockerfile"
add_file "nginx/default.conf"
add_file ".gitignore"
add_file ".dockerignore"

# Backend
add_file "backend/Dockerfile"
add_file "backend/.dockerignore"
add_file "backend/package.json"
add_file "backend/src/db.js"
add_file "backend/src/index.js"

# Frontend
add_file "frontend/Dockerfile"
add_file "frontend/.dockerignore"
add_file "frontend/package.json"
add_file "frontend/vite.config.js"
add_file "frontend/src/main.jsx"
add_file "frontend/src/App.jsx"

# Todos los .env que existan en el proyecto (root, backend, frontend, .env.example...)
echo "===== .env encontrados =====" >> "$OUTPUT"
find . \
    -path "*/node_modules" -prune -o \
    -path "*/postgres_data" -prune -o \
    -path "*/.git" -prune -o \
    -path "*/dist" -prune -o \
    -path "*/build" -prune -o \
    -iname ".env*" -type f -print 2>/dev/null | while read -r f; do
        add_file "$f"
    done

# Estructura de frontend/src (para ubicar dónde vive la URL del API)
echo "===== Estructura frontend/src =====" >> "$OUTPUT"
find frontend/src -type f >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Contenido de services/ (api.js) y context/ (AuthContext.jsx) — ahí suele
# vivir la URL base del API y es lo que más rompe entre local y AWS
find frontend/src/services frontend/src/context -type f 2>/dev/null | while read -r f; do
    add_file "$f"
done

echo "Listo -> $OUTPUT"
echo "No toqué mi-llave-aws.pem, postgres_data/ ni certbot/conf (no hacen falta para esto, y son justo lo que conviene no compartir aunque sea un demo)."
