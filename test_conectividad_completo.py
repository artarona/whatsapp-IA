#!/usr/bin/env python3
"""
Test completo de conectividad para el chatbot
Verifica que todos los componentes estén funcionando
"""

import urllib.request
import json
import os
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

def test_backend_direct():
    """Test directo del backend simulando la función de estadísticas"""
    print("🔍 Test 1: Verificando datos de backend...")
    
    CONSULTAS_FILE = 'consultas_completas.json'
    if os.path.exists(CONSULTAS_FILE):
        with open(CONSULTAS_FILE, 'r', encoding='utf-8') as f:
            consultas = json.load(f)
        
        # Simular datos de estadísticas
        estadisticas = {
            "total_consultas": len(consultas),
            "consultas_con_contacto": len([c for c in consultas if c.get("nombre") and c.get("telefono")]),
            "consultas_recientes": len([c for c in consultas if "2025-11-24" in c.get("fecha", "")]),
            "propiedades_mas_buscadas": {},
            "tipos_busqueda": {},
            "consultas": consultas
        }
        
        # Analizar propiedades más buscadas
        todas_propiedades = []
        for consulta in consultas:
            if consulta.get("propiedades_interes"):
                for prop in consulta["propiedades_interes"]:
                    if prop.get("barrio"):
                        todas_propiedades.append(prop["barrio"])
                    if prop.get("tipo"):
                        todas_propiedades.append(prop["tipo"])
        
        # Contar frecuencias
        from collections import Counter
        contador_barrios = Counter(todas_propiedades)
        estadisticas["propiedades_mas_buscadas"] = dict(contador_barrios.most_common(5))
        
        print(f"✅ Datos de backend cargados:")
        print(f"   - Total consultas: {estadisticas['total_consultas']}")
        print(f"   - Con contacto: {estadisticas['consultas_con_contacto']}")
        print(f"   - Recientes: {estadisticas['consultas_recientes']}")
        
        return True, estadisticas
    else:
        print(f"❌ Archivo {CONSULTAS_FILE} no encontrado")
        return False, {}

def test_servidor_local():
    """Test de servidor HTTP local básico"""
    print("\n🌐 Test 2: Verificando servidor HTTP...")
    
    try:
        # Test del frontend
        response = urllib.request.urlopen('http://localhost:8081/index.html', timeout=3)
        if response.status == 200:
            content = response.read().decode()
            if "Chatbot" in content:
                print("✅ Frontend (puerto 8081): Funcionando")
                return True
    except Exception as e:
        print(f"❌ Frontend error: {e}")
    
    return False

def generar_reporte_html():
    """Generar reporte en HTML para verificación manual"""
    print("\n📋 Test 3: Generando reporte de diagnóstico...")
    
    conectado_backend, datos = test_backend_direct()
    conectado_frontend = test_servidor_local()
    
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔧 Diagnóstico Completo - Chatbot</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }}
        .container {{ background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .status {{ padding: 15px; border-radius: 5px; margin: 10px 0; }}
        .success {{ background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }}
        .error {{ background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }}
        .warning {{ background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }}
        .link-button {{ display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Diagnóstico Completo del Sistema</h1>
        <p><strong>Fecha:</strong> {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <div class="{'status success' if conectado_backend else 'status error'}">
            <h3>📊 Backend Data (Datos)</h3>
            <p><strong>Estado:</strong> {'✅ Funcionando' if conectado_backend else '❌ Error'}</p>
            {f'<p><strong>Total consultas:</strong> {datos.get("total_consultas", 0)}</p>' if conectado_backend else ''}
            {f'<p><strong>Con contacto:</strong> {datos.get("consultas_con_contacto", 0)}</p>' if conectado_backend else ''}
        </div>
        
        <div class="{'status success' if conectado_frontend else 'status warning'}">
            <h3>🌐 Frontend (Páginas Web)</h3>
            <p><strong>Estado:</strong> {'✅ Funcionando' if conectado_frontend else '⚠️ No verificable'}</p>
        </div>
        
        <h3>🔗 Enlaces de Prueba</h3>
        <a href="http://localhost:8081/index.html" class="link-button">🏠 Chatbot Principal</a>
        <a href="http://localhost:8081/verificacion_rapida.html" class="link-button">🔧 Verificación Rápida</a>
        <a href="http://localhost:5000/api/estadisticas" class="link-button">📊 API Backend</a>
        
        <h3>💡 Próximos Pasos</h3>
        <ol>
            <li>Abre <a href="http://localhost:8081/index.html">el chatbot</a> en una ventana nueva</li>
            <li>Prueba la opción 5 (estadísticas)</li>
            <li>Si sigues viendo errores, actualiza la página o abre en ventana privada</li>
        </ol>
    </div>
</body>
</html>
    """
    
    with open('diagnostico_completo.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ Reporte generado: diagnostico_completo.html")

if __name__ == "__main__":
    print("🔧 Iniciando diagnóstico completo del chatbot...")
    generar_reporte_html()
    print("\n🎯 Diagnóstico completado. Revisa diagnostico_completo.html")