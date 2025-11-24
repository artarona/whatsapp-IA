#!/bin/bash

# Script para verificar y reiniciar el chatbot
echo "🔧 VERIFICACIÓN Y REINICIO DEL CHATBOT"
echo "======================================="

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Puerto $port: En uso"
        return 0
    else
        echo "❌ Puerto $port: Libre"
        return 1
    fi
}

# Verificar puertos
echo "📡 Verificando puertos..."
check_port 5000
check_port 8081

echo ""
echo "💾 Verificando datos..."
if [ -f "consultas_completas.json" ]; then
    total_consultas=$(python3 -c "import json; print(len(json.load(open('consultas_completas.json'))))" 2>/dev/null || echo "0")
    echo "✅ Datos encontrados: $total_consultas consultas"
else
    echo "❌ Archivo consultas_completas.json no encontrado"
fi

echo ""
echo "🌐 URLs disponibles para probar:"
echo "• Chatbot: http://localhost:8081/index.html"
echo "• Verificación: http://localhost:8081/verificacion_rapida.html"
echo "• API: http://localhost:5000/api/estadisticas"
echo ""
echo "⚠️  Si ves errores de conectividad:"
echo "1. Actualiza las páginas"
echo "2. Usa ventana privada del navegador"
echo "3. Cierra todas las pestañas y vuelve a abrir"