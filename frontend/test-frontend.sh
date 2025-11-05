#!/bin/bash

# Script para ejecutar tests del frontend
# Este script puede ejecutarse localmente o en CI/CD

echo "🧪 Iniciando tests del frontend..."

# Verificar si estamos en un entorno CI o local
if [ "$CI" = "true" ]; then
    echo "📋 Entorno CI detectado"
    
    # En CI, simplemente verificamos que los archivos existen
    echo "🔍 Verificando archivos del frontend..."
    
    required_files=(
        "frontend/www/index.html"
        "frontend/www/css/styles.css"
        "frontend/www/js/api.js"
        "frontend/www/js/components.js"
        "frontend/www/js/app.js"
        "frontend/nginx/nginx.conf"
        "frontend/nginx/default.conf"
        "frontend/Dockerfile"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Archivo faltante: $file"
            exit 1
        else
            echo "✅ $file existe"
        fi
    done
    
    echo "✅ Todos los archivos del frontend están presentes"
    echo "⚠️  Nota: Tests funcionales requieren navegador web"
    
else
    echo "📋 Entorno local detectado"
    
    # En desarrollo local, verificar Node.js si está disponible
    if command -v node &> /dev/null; then
        echo "🔧 Node.js detectado, verificando estructura..."
        
        # Verificar que los archivos JS son sintácticamente válidos
        js_files=(
            "frontend/www/js/api.js"
            "frontend/www/js/components.js"
            "frontend/www/js/app.js"
            "frontend/www/js/tests.js"
        )
        
        for file in "${js_files[@]}"; do
            if node -c "$file" 2>/dev/null; then
                echo "✅ $file - Sintaxis válida"
            else
                echo "❌ $file - Error de sintaxis"
                exit 1
            fi
        done
    else
        echo "⚠️  Node.js no disponible, omitiendo validación de sintaxis"
    fi
    
    echo "✅ Tests básicos completados"
    echo "💡 Para tests completos, abre frontend/www/index.html en un navegador"
    echo "💡 Luego ejecuta: frontendTests.run() en la consola del navegador"
fi

echo "✅ Tests del frontend finalizados exitosamente"