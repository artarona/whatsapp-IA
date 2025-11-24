#!/usr/bin/env python3
"""
Script simple para iniciar el chatbot con verificación de estado
"""

import os
import sys
import time
import signal
import subprocess
import json
from datetime import datetime

def cargar_consultas():
    """Cargar consultas para verificar que los datos estén disponibles"""
    CONSULTAS_FILE = 'consultas_completas.json'
    if os.path.exists(CONSULTAS_FILE):
        with open(CONSULTAS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def generar_estadisticas():
    """Generar estadísticas de las consultas"""
    consultas = cargar_consultas()
    
    estadisticas = {
        "total_consultas": len(consultas),
        "consultas_con_contacto": len([c for c in consultas if c.get("nombre") and c.get("telefono")]),
        "consultas_recientes": len([c for c in consultas if "2025-11-24" in c.get("fecha", "")]),
        "fecha_actualizacion": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "consultas": consultas
    }
    
    return estadisticas

def verificar_archivos():
    """Verificar que todos los archivos necesarios existan"""
    archivos_requeridos = [
        'chatbot_backend_simple.py',
        'index.html',
        'verificacion_rapida.html',
        'consultas_completas.json'
    ]
    
    print("🔍 Verificando archivos del sistema...")
    archivos_ok = True
    
    for archivo in archivos_requeridos:
        if os.path.exists(archivo):
            print(f"✅ {archivo}")
        else:
            print(f"❌ {archivo} - NO ENCONTRADO")
            archivos_ok = False
    
    return archivos_ok

def imprimir_estado():
    """Imprimir estado actual del sistema"""
    consultas = cargar_consultas()
    
    print("\n" + "="*60)
    print("📊 ESTADO ACTUAL DEL CHATBOT")
    print("="*60)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"💾 Total consultas guardadas: {len(consultas)}")
    print(f"👥 Consultas con contacto: {len([c for c in consultas if c.get('nombre') and c.get('telefono'))]}")
    print(f"🆕 Consultas de hoy: {len([c for c in consultas if '2025-11-24' in c.get('fecha', '')])}")
    
    if consultas:
        print("\n📋 ÚLTIMAS CONSULTAS:")
        for i, consulta in enumerate(consultas[-3:], 1):
            print(f"  {i}. {consulta.get('nombre', 'Sin nombre')} - {consulta.get('fecha', '').split('T')[1][:8]}")
    
    print("\n🌐 URLs PARA PROBAR:")
    print("• Chatbot principal: http://localhost:8081/index.html")
    print("• Verificación rápida: http://localhost:8081/verificacion_rapida.html") 
    print("• Diagnóstico completo: http://localhost:8081/diagnostico_completo.html")
    print("• API estadísticas: http://localhost:5000/api/estadisticas")
    print("="*60)

def main():
    print("🚀 INICIANDO SISTEMA DE CHATBOT")
    print("="*50)
    
    # Verificar archivos
    if not verificar_archivos():
        print("\n❌ Faltan archivos necesarios. Revisa la instalación.")
        sys.exit(1)
    
    # Verificar datos
    consultas = cargar_consultas()
    print(f"\n📁 Datos encontrados: {len(consultas)} consultas")
    
    # Mostrar estado actual
    imprimir_estado()
    
    print("\n🎯 INSTRUCCIONES:")
    print("1. Abre http://localhost:8081/index.html en tu navegador")
    print("2. Prueba la opción 5 (estadísticas)")
    print("3. Si ves errores, refresca la página o usa ventana privada")
    print("\n⚠️ Mantén esta terminal abierta para mantener el backend activo")

if __name__ == "__main__":
    main()