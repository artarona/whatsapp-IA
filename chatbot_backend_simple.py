#!/usr/bin/env python3
"""
Backend simple para el chatbot sin dependencias externas
Usa solo el servidor HTTP estándar de Python
"""

import json
import os
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import csv
from io import StringIO

# Archivo para guardar todas las consultas
CONSULTAS_FILE = 'consultas_completas.json'

def cargar_consultas():
    """Cargar todas las consultas desde el archivo JSON"""
    if os.path.exists(CONSULTAS_FILE):
        with open(CONSULTAS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def guardar_consulta(consulta):
    """Guardar una nueva consulta"""
    consultas = cargar_consultas()
    consultas.append(consulta)
    with open(CONSULTAS_FILE, 'w', encoding='utf-8') as f:
        json.dump(consultas, f, ensure_ascii=False, indent=2)

class ChatbotHandler(BaseHTTPRequestHandler):
    def add_cors_headers(self):
        """Agregar cabeceras CORS a todas las respuestas"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        """Manejar peticiones OPTIONS para CORS"""
        self.send_response(200)
        self.add_cors_headers()
        self.end_headers()

    def do_POST(self):
        """Manejar peticiones POST"""
        if self.path == '/api/consulta':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                consulta = {
                    'id': f"CONS_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    'fecha': datetime.now().isoformat(),
                    'nombre': data.get('nombre', ''),
                    'telefono': data.get('telefono', ''),
                    'email': data.get('email', ''),
                    'propiedades_interes': data.get('propiedades', [])
                }
                
                guardar_consulta(consulta)
                
                # Respuesta
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'success': True,
                    'mensaje': 'Consulta guardada exitosamente',
                    'id_consulta': consulta['id']
                }
                
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = {'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        """Manejar peticiones GET"""
        if self.path == '/api/consultas':
            # Obtener todas las consultas
            consultas = cargar_consultas()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.add_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(consultas).encode('utf-8'))
            
        elif self.path == '/api/estadisticas':
            # Obtener estadísticas
            consultas = cargar_consultas()
            
            stats = {
                'total_consultas': len(consultas),
                'consultas_por_fecha': {},
                'tipos_propiedades_interes': {},
                'barrios_interes': {},
                'operaciones_interes': {}
            }
            
            for consulta in consultas:
                fecha = consulta['fecha'][:10]
                stats['consultas_por_fecha'][fecha] = stats['consultas_por_fecha'].get(fecha, 0) + 1
                
                for prop in consulta.get('propiedades_interes', []):
                    tipo = prop.get('tipo', 'No especificado')
                    barrio = prop.get('barrio', 'No especificado')
                    operacion = prop.get('operacion', 'No especificado')
                    
                    stats['tipos_propiedades_interes'][tipo] = stats['tipos_propiedades_interes'].get(tipo, 0) + 1
                    stats['barrios_interes'][barrio] = stats['barrios_interes'].get(barrio, 0) + 1
                    stats['operaciones_interes'][operacion] = stats['operaciones_interes'].get(operacion, 0) + 1
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.add_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(stats).encode('utf-8'))
            
        elif self.path.startswith('/api/exportar-excel'):
            # Exportar a CSV (más simple que Excel)
            consultas = cargar_consultas()
            
            if not consultas:
                self.send_response(404)
                self.end_headers()
                return
            
            # Crear CSV en memoria
            output = StringIO()
            writer = csv.writer(output)
            
            # Headers
            writer.writerow([
                'ID_Consulta', 'Fecha', 'Nombre', 'Telefono', 'Email',
                'ID_Propiedad', 'Titulo', 'Barrio', 'Tipo', 'Precio', 
                'Moneda', 'Ambientes', 'Metros_Cuadrados', 'Operacion', 'Descripcion'
            ])
            
            # Datos
            for consulta in consultas:
                for prop in consulta.get('propiedades_interes', []):
                    writer.writerow([
                        consulta['id'],
                        consulta['fecha'],
                        consulta['nombre'],
                        consulta['telefono'],
                        consulta['email'],
                        prop.get('id_temporal', ''),
                        prop.get('titulo', ''),
                        prop.get('barrio', ''),
                        prop.get('tipo', ''),
                        prop.get('precio', ''),
                        prop.get('moneda_precio', ''),
                        prop.get('ambientes', ''),
                        prop.get('metros_cuadrados', ''),
                        prop.get('operacion', ''),
                        prop.get('descripcion', '')
                    ])
            
            csv_content = output.getvalue()
            output.close()
            
            # Enviar archivo
            filename = f"consultas_dante_completas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv')
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.add_cors_headers()
            self.end_headers()
            
            self.wfile.write(csv_content.encode('utf-8'))
            
        elif self.path == '/propiedades.json':
            # Servir archivo de propiedades
            try:
                with open('propiedades.json', 'r', encoding='utf-8') as f:
                    contenido = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.add_cors_headers()
                self.end_headers()
                self.wfile.write(contenido.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.add_cors_headers()
                self.end_headers()
        
        else:
            self.send_response(404)
            self.end_headers()

def main():
    print("🚀 Iniciando backend del chatbot (sin dependencias externas)...")
    print("📊 Endpoints disponibles:")
    print("   POST /api/consulta - Guardar consulta")
    print("   GET  /api/consultas - Obtener todas las consultas")
    print("   GET  /api/exportar-excel - Exportar a CSV")
    print("   GET  /api/estadisticas - Ver estadísticas")
    print("   GET  /propiedades.json - Servir propiedades")
    
    server = HTTPServer(('0.0.0.0', 5000), ChatbotHandler)
    print("\n🌐 Backend funcionando en: http://localhost:5000")
    print("💡 Ahora puedes abrir: http://localhost:8081/index.html")
    print("\n⏹️  Para cerrar el servidor: Ctrl+C")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido.")
        server.shutdown()

if __name__ == '__main__':
    main()