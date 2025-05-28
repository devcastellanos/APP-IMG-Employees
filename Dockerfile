# Etapa 1: Base de desarrollo con pnpm
FROM node:18-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero
COPY pnpm-lock.yaml ./
COPY package.json ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código fuente
COPY . .

# Build de producción
RUN pnpm build

# Exponer el puerto por defecto de vite preview
EXPOSE 4173

# Comando para iniciar el servidor de preview
CMD ["pnpm", "preview", "--host"]
