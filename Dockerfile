# 🔵 ETAPA 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Copiamos los archivos de configuración de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el código fuente del proyecto
COPY . .

# Compilamos para producción con Angular
RUN npm run build -- --configuration=production

# 🔵 ETAPA 2: Servidor NGINX
FROM nginx:alpine

# Copiamos el build generado a la carpeta pública de nginx
# Nota: Ajustamos la ruta de origen para coincidir con el nombre de tu proyecto y la estructura de salida de Angular (browser)
COPY --from=build /app/dist/ecommerce-juegos-de-mesa-angular/browser /usr/share/nginx/html

# Copiamos una configuración básica de nginx si es necesaria (opcional, pero recomendada para SPA)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Nginx arranca por defecto
CMD ["nginx", "-g", "daemon off;"]
