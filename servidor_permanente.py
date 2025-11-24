#!/usr/bin/env python3
"""
Script para mantener los servidores del chatbot activos de manera continua
Este script inicia y mantiene ambos servidores funcionando sin interrupciones
"""

import subprocess
import time
import sys
import os
from datetime import datetime

def log(message):
    """Registrar mensajes con timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def iniciar_backend():
    """Iniciar el servidor backend del chatbot"""
    try:
        log("🚀 Iniciando servidor backend (puerto 5000)...")
        subprocess.Popen([
            "python3", "chatbot_backend_simple.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(2)
        
        # Verificar que esté funcionando
        result = subprocess.run([
            "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", 
            "http://localhost:5000/api/estadisticas"
        ], capture_output=True, text=True)
        
        if result.stdout.strip() == "200":
            log("✅ Backend iniciado correctamente")
            return True
        else:
            log("❌ Error iniciando backend")
            return False
    except Exception as e:
        log(f"❌ Error iniciando backend: {e}")
        return False

def iniciar_frontend():
    """Iniciar el servidor frontend"""
    try:
        log("🌐 Iniciando servidor frontend (puerto 8081)...")
        subprocess.Popen([
            "python3", "-m", "http.server", "8081"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(2)
        
        # Verificar que esté funcionando
        result = subprocess.run([
            "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", 
            "http://localhost:8081/index.html"
        ], capture_output=True, text=True)
        
        if result.stdout.strip() == "200":
            log("✅ Frontend iniciado correctamente")
            return True
        else:
            log("❌ Error iniciando frontend")
            return False
    except Exception as e:
        log(f"❌ Error iniciando frontend: {e}")
        return False

def verificar_servidores():
    """Verificar que ambos servidores estén funcionando"""
    try:
        backend_ok = subprocess.run([
            "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", 
            "http://localhost:5000/api/estadisticas"
        ], capture_output=True, text=True).stdout.strip() == "200"
        
        frontend_ok = subprocess.run([
            "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", 
            "http://localhost:8081/index.html"
        ], capture_output=True, text=True).stdout.strip() == "200"
        
        return backend_ok, frontend_ok
    except:
        return False, False

def main():
    log("🔧 Iniciando sistema completo de servidores para el chatbot...")
    
    # Iniciar servidores
    backend_ok = iniciar_backend()
    frontend_ok = iniciar_frontend()
    
    if not backend_ok or not frontend_ok:
        log("❌ Error iniciando servidores. Reintentando en 5 segundos...")
        time.sleep(5)
        backend_ok = iniciar_backend()
        frontend_ok = iniciar_frontend()
    
    if backend_ok and frontend_ok:
        log("🎉 Sistema completo funcionando correctamente")
        log("📊 Backend: http://localhost:5000")
        log("🌐 Frontend: http://localhost:8081")
        log("🔄 Monitoreando estado cada 30 segundos...")
        
        # Monitoreo continuo
        try:
            while True:
                time.sleep(30)
                backend_ok, frontend_ok = verificar_servidores()
                
                if not backend_ok:
                    log("⚠️ Backend no disponible. Reiniciando...")
                    iniciar_backend()
                    
                if not frontend_ok:
                    log("⚠️ Frontend no disponible. Reiniciando...")
                    iniciar_frontend()
                    
                if backend_ok and frontend_ok:
                    log("✅ Servidores funcionando correctamente")
                
        except KeyboardInterrupt:
            log("🛑 Deteniendo servidores...")
            # Matar procesos
            subprocess.run(["pkill", "-f", "chatbot_backend_simple.py"])
            subprocess.run(["pkill", "-f", "python.*-m.*http.server.*8081"])
            log("✅ Servidores detenidos")
    else:
        log("❌ No se pudieron iniciar los servidores. Revisar configuración.")
        sys.exit(1)

if __name__ == "__main__":
    main()