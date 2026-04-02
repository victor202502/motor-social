FROM node:20-alpine
WORKDIR /app
COPY package*.json ./

# Añadimos el flag --legacy-peer-deps para ignorar conflictos menores de versiones
RUN npm install --legacy-peer-deps

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]