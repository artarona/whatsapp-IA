#!/bin/bash

echo "🔄 Reiniciando servidores del chatbot..."

# Detener todos los procesos relacionados
echo "🛑 Deteniendo procesos existentes..."
pkill -f chatbot_backend_simple.py || echo "Backend ya detenido"
pkill -f "python.*-m.*http.server.*8081" || echo "Frontend ya detenido"

# Esperar un momento
sleep 2

# Iniciar backend
echo "🚀 Iniciando backend..."
cd /workspace
python3 chatbot_backend_simple.py &
BACKEND_PID=$!

# Esperar un momento
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend..."
python3 -m http.server 8081 &
FRONTEND_PID=$!

# Verificar que estén funcionando
sleep 3

echo ""
echo "📊 Verificando estado de los servidores..."
echo -n "Backend (puerto 5000): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/estadisticas | grep -q "200"; then
    echo "✅ Funcionando"
else
    echo "❌ Error"
fi

echo -n "Frontend (puerto 8081): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/index.html | grep -q "200"; then
    echo "✅ Funcionando"
else
    echo "❌ Error"
fi

echo ""
echo "🎯 URLs para probar:"
echo "   • Chatbot: http://localhost:8081/index.html"
echo "   • Verificación: http://localhost:8081/verificacion_rapida.html"
echo "   • Test avanzado: http://localhost:8081/test_estadisticas.html"
echo "   • API Backend: http://localhost:5000/api/estadisticas"

echo ""
echo "⚠️ Si persiste el problema:"
echo "1. Refresca la página del chatbot"
echo "2. Prueba en una ventana privada del navegador"
echo "3. Ejecuta: bash reiniciar_servidores.sh"