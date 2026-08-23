# ETAPA 1: Compilar Frontend React/Vite
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
# VITE_API_URL vacío para que use rutas relativas mágicamente
ENV VITE_API_URL=""
RUN npm run build

# ETAPA 2: Preparar Backend unificado
FROM node:20-alpine
WORKDIR /app

# Instalar dependencias del Backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Copiar el Frontend compilado a la carpeta public del backend
COPY --from=frontend-builder /app/dist ./public

# TRUCO MÁGICO: Inyectar Express para que sirva el Frontend compilado sin tocar tu código
RUN sed -i 's/app.listen/app.use(express.static("public"));\napp.get("*", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "index.html")));\napp.listen/g' src/index.js

# Preparar carpetas y permisos para subida de imágenes
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE 3000

# Arrancar ejecutando las migraciones primero, y luego levantando el servidor
CMD ["sh", "-c", "npm run db:migrate && node src/index.js"]