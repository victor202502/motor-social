# Recolecta en un solo .txt los archivos necesarios para revisar la
# configuracion de entorno (local + AWS) de motor-social.
# Ejecutar desde la raiz del proyecto (donde esta docker-compose.yml):
#   powershell -ExecutionPolicy Bypass -File .\recolectar_contexto.ps1

if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "No encuentro docker-compose.yml aqui. Ejecuta esto desde la raiz del proyecto (motor-social/)."
    exit 1
}

$Output = "contexto_env.txt"
New-Item -Path $Output -ItemType File -Force | Out-Null

function Add-FileContent {
    param([string]$Path)
    if (Test-Path $Path -PathType Leaf) {
        Add-Content -Path $Output -Value "===== $Path =====" -Encoding UTF8
        Get-Content -Path $Path -Raw -Encoding UTF8 | Add-Content -Path $Output -Encoding UTF8
        Add-Content -Path $Output -Value "" -Encoding UTF8
        Add-Content -Path $Output -Value "" -Encoding UTF8
    } else {
        Add-Content -Path $Output -Value "===== $Path (no existe) =====" -Encoding UTF8
        Add-Content -Path $Output -Value "" -Encoding UTF8
    }
}

Write-Host "Recolectando..."

# Orquestacion / despliegue
Add-FileContent "docker-compose.yml"
Add-FileContent "docker-entrypoint.sh"
Add-FileContent "Dockerfile"
Add-FileContent "nginx\default.conf"
Add-FileContent ".gitignore"
Add-FileContent ".dockerignore"

# Backend
Add-FileContent "backend\Dockerfile"
Add-FileContent "backend\.dockerignore"
Add-FileContent "backend\package.json"
Add-FileContent "backend\src\db.js"
Add-FileContent "backend\src\index.js"

# Frontend
Add-FileContent "frontend\Dockerfile"
Add-FileContent "frontend\.dockerignore"
Add-FileContent "frontend\package.json"
Add-FileContent "frontend\vite.config.js"
Add-FileContent "frontend\src\main.jsx"
Add-FileContent "frontend\src\App.jsx"

# Todos los .env en las ubicaciones habituales
Add-Content -Path $Output -Value "===== .env encontrados =====" -Encoding UTF8
$envLocations = @(".", "backend", "frontend", "backend\src", "frontend\src")
foreach ($loc in $envLocations) {
    if (Test-Path $loc) {
        Get-ChildItem -Path $loc -Filter ".env*" -File -Force -ErrorAction SilentlyContinue | ForEach-Object {
            Add-FileContent (Resolve-Path -Relative $_.FullName)
        }
    }
}

# Estructura de frontend/src (para ubicar donde vive la URL del API)
Add-Content -Path $Output -Value "===== Estructura frontend\src =====" -Encoding UTF8
if (Test-Path "frontend\src") {
    Get-ChildItem -Path "frontend\src" -Recurse -File | ForEach-Object {
        Add-Content -Path $Output -Value (Resolve-Path -Relative $_.FullName) -Encoding UTF8
    }
}
Add-Content -Path $Output -Value "" -Encoding UTF8

# Contenido de services/ (api.js) y context/ (AuthContext.jsx) -- ahi suele
# vivir la URL base del API y es lo que mas rompe entre local y AWS
foreach ($dir in @("frontend\src\services", "frontend\src\context")) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Recurse -File | ForEach-Object {
            Add-FileContent (Resolve-Path -Relative $_.FullName)
        }
    }
}

Write-Host "Listo -> $Output"
Write-Host "No toque mi-llave-aws.pem, postgres_data ni certbot\conf (no hacen falta para esto, y son justo lo que conviene no compartir aunque sea un demo)."
