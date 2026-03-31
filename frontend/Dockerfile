FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Vite necesita este flag para aceptar conexiones externas en Docker
CMD ["npm", "run", "dev", "--", "--host"]