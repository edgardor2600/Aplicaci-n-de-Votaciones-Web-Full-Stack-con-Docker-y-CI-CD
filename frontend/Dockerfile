# Dockerfile para Frontend Cats vs Dogs
# Imagen basada en Nginx Alpine para serving de archivos estáticos

FROM nginx:alpine

# Metadatos de la imagen
LABEL maintainer="Voting App Team"
LABEL description="Frontend para aplicación de votación Cats vs Dogs"
LABEL version="1.0.0"

# Instalar utilidades básicas
RUN apk add --no-cache bash curl

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Copiar configuraciones de Nginx personalizadas
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar archivos web al directorio estándar de Nginx
COPY www/ /usr/share/nginx/www/

# Configurar permisos apropiados
RUN chmod -R 755 /usr/share/nginx/www/
RUN chmod -R 644 /etc/nginx/nginx.conf
RUN chmod -R 644 /etc/nginx/conf.d/default.conf

# Crear archivo de favicon básico si no existe
RUN touch /usr/share/nginx/www/assets/images/favicon.ico

# Configurar variables de entorno de Nginx
ENV NGINX_PORT=80
ENV NGINX_USER=nginx
ENV NGINX_WORKER_PROCESSES=auto

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]