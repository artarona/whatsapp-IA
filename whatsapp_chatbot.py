#!/usr/bin/env python3
"""
🤖 SISTEMA DE CHATBOT WHATSAPP INTELIGENTE
📱 Propiedades Dante - Búsqueda Automática por WhatsApp

Características:
- Procesamiento de lenguaje natural en español
- Búsqueda inteligente en propiedades.json
- Respuestas con imágenes y detalles
- Integración con WhatsApp Business API
- Compatible con Render.com y GitHub Pages

Autor: MiniMax Agent
Fecha: 2025-11-22
"""

import json
import re
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from flask import Flask, request, jsonify
from flask_cors import CORS

# =============================================================================
# 🧠 MOTOR DE IA PARA PROCESAMIENTO DE CONSULTAS
# =============================================================================

@dataclass
class SearchQuery:
    """Clase para representar una consulta de búsqueda"""
    barrios: List[str] = None
    tipos: List[str] = None
    operaciones: List[str] = None
    precio_min: Optional[int] = None
    precio_max: Optional[int] = None
    ambientes_min: Optional[int] = None
    ambientes_max: Optional[int] = None
    metros_min: Optional[int] = None
    metros_max: Optional[int] = None
    amenities: List[str] = None
    texto_libre: str = ""

class ChatbotAI:
    """Motor de inteligencia artificial para procesar consultas WhatsApp"""
    
    def __init__(self, propiedades_file: str):
        self.propiedades_file = propiedades_file
        self.propiedades = self._load_propiedades()
        self._load_knowledge_base()
    
    def _load_propiedades(self) -> List[Dict]:
        """Carga las propiedades desde el archivo JSON"""
        try:
            with open(self.propiedades_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error cargando propiedades: {e}")
            return []
    
    def _load_knowledge_base(self):
        """Carga la base de conocimiento para sinónimos y patrones"""
        
        # Sinónimos de barrios (más completos)
        self.barrios_synonyms = {
            'palermo': ['palermo', 'palermo soho', 'palermo hollywood', 'palermo viejo'],
            'microcentro': ['microcentro', 'centro', 'downtown', 'congreso', 'plaza mayo'],
            'recoleta': ['recoleta', 'cementerio', 'alvear', 'ayacucho'],
            'núñez': ['núñez', 'nunez', 'barrio núñez'],
            'belgrano': ['belgrano', 'barrio belgrano', 'belgrano c'],
            'caballito': ['caballito', 'barrio caballito'],
            'villa crespo': ['villa crespo', 'crespo'],
            'san telmo': ['san telmo', 'telmo'],
            'retiro': ['retiro', 'estación retiro'],
            'abasto': ['abasto', 'corrientes'],
            'almagro': ['almagro'],
            'parque avellaneda': ['parque avellaneda', 'avellaneda']
        }
        
        # Sinónimos de tipos de propiedades
        self.tipos_synonyms = {
            'departamento': ['departamento', 'depto', 'apartamento', 'unidad'],
            'casa': ['casa', 'chalet', 'vivienda'],
            'monoambiente': ['monoambiente', '1 ambiente', 'estudio', 'loft'],
            'local': ['local', 'comercio', 'local comercial'],
            'oficina': ['oficina', 'consultorio', 'gabinete'],
            'cochera': ['cochera', 'garage', 'estacionamiento']
        }
        
        # Sinónimos de operaciones
        self.operaciones_synonyms = {
            'venta': ['venta', 'comprar', 'compra', 'vendo'],
            'alquiler': ['alquiler', 'alquilar', 'renta', 'rentar']
        }
        
        # Sinónimos de amenities
        self.amenities_synonyms = {
            'pileta': ['pileta', 'piscina', 'pool', 'natación'],
            'cochera': ['cochera', 'garage', 'estacionamiento', 'auto'],
            'balcon': ['balcón', 'balcon', 'terraza', 'balcon privado'],
            'aire': ['aire acondicionado', 'aire', 'a/c', 'ac'],
            'mascotas': ['acepta mascotas', 'mascotas', 'pet friendly', 'pets'],
            'expensas': ['expensas', 'expensas bajas', 'sin expensas']
        }
    
    def _normalize_text(self, text: str) -> str:
        """Normaliza el texto para mejor procesamiento"""
        text = text.lower().strip()
        # Eliminar caracteres especiales pero mantener algunos importantes
        text = re.sub(r'[^\w\s\-\$]', '', text)
        return text
    
    def _extract_numbers(self, text: str) -> List[int]:
        """Extrae números del texto"""
        # Buscar números con separadores de miles
        pattern = r'\b(?:usd\s*)?(\d{1,3}(?:[.,]\d{3})*|\d+)\b'
        matches = re.findall(pattern, text.lower())
        numbers = []
        for match in matches:
            try:
                # Remover separadores de miles
                num_str = match.replace('.', '').replace(',', '')
                numbers.append(int(num_str))
            except:
                continue
        return numbers
    
    def _detect_amenities(self, text: str) -> List[str]:
        """Detecta amenidades mencionadas en el texto"""
        detected_amenities = []
        
        for amenity, synonyms in self.amenities_synonyms.items():
            for synonym in synonyms:
                if synonym in text:
                    detected_amenities.append(amenity)
                    break
        
        return detected_amenities
    
    def parse_query(self, message: str) -> SearchQuery:
        """Parsea un mensaje de WhatsApp en una consulta estructurada"""
        message = self._normalize_text(message)
        query = SearchQuery()
        query.texto_libre = message
        
        # Extraer barrios
        query.barrios = []
        for barrio, synonyms in self.barrios_synonyms.items():
            for synonym in synonyms:
                if synonym in message:
                    query.barrios.append(barrio)
                    break
        
        # Extraer tipos
        query.tipos = []
        for tipo, synonyms in self.tipos_synonyms.items():
            for synonym in synonyms:
                if synonym in message:
                    query.tipos.append(tipo)
                    break
        
        # Extraer operaciones
        query.operaciones = []
        for operacion, synonyms in self.operaciones_synonyms.items():
            for synonym in synonyms:
                if synonym in message:
                    query.operaciones.append(operacion)
                    break
        
        # Extraer números (precios, ambientes, metros)
        numbers = self._extract_numbers(message)
        if numbers:
            # Lógica para determinar qué números representan
            if 'usd' in message or 'precio' in message or 'hasta' in message:
                if len(numbers) == 1:
                    query.precio_max = numbers[0]
                elif len(numbers) >= 2:
                    query.precio_min = numbers[0]
                    query.precio_max = numbers[-1]
            elif 'ambiente' in message:
                query.ambientes_min = min(numbers)
                query.ambientes_max = max(numbers)
            elif 'metro' in message or 'm2' in message:
                query.metros_min = min(numbers)
                query.metros_max = max(numbers)
        
        # Detectar amenidades
        query.amenities = self._detect_amenities(message)
        
        return query
    
    def search_properties(self, query: SearchQuery) -> List[Dict]:
        """Busca propiedades basadas en la consulta"""
        results = []
        
        for propiedad in self.propiedades:
            score = 0
            
            # Buscar por barrio
            if query.barrios:
                barrio_normalized = propiedad.get('barrio', '').lower()
                for barrio_buscado in query.barrios:
                    if barrio_buscado.lower() in barrio_normalized:
                        score += 10
            
            # Buscar por tipo
            if query.tipos:
                tipo_normalized = propiedad.get('tipo', '').lower()
                for tipo_buscado in query.tipos:
                    if tipo_buscado.lower() in tipo_normalized:
                        score += 8
            
            # Buscar por operación
            if query.operaciones:
                operacion_normalized = propiedad.get('operacion', '').lower()
                for operacion_buscada in query.operaciones:
                    if operacion_buscada.lower() in operacion_normalized:
                        score += 6
            
            # Buscar por precio
            precio = propiedad.get('precio', 0)
            if query.precio_min and precio < query.precio_min:
                continue
            if query.precio_max and precio > query.precio_max:
                continue
            if query.precio_min or query.precio_max:
                score += 5
            
            # Buscar por ambientes
            ambientes = propiedad.get('ambientes', 0)
            if query.ambientes_min and ambientes < query.ambientes_min:
                continue
            if query.ambientes_max and ambientes > query.ambientes_max:
                continue
            if query.ambientes_min or query.ambientes_max:
                score += 4
            
            # Buscar por metros
            metros = propiedad.get('metros_cuadrados', 0)
            if query.metros_min and metros < query.metros_min:
                continue
            if query.metros_max and metros > query.metros_max:
                continue
            if query.metros_min or query.metros_max:
                score += 3
            
            # Buscar por amenities
            if query.amenities:
                amenities_match = 0
                for amenity in query.amenities:
                    if amenity in ['pileta']:
                        if propiedad.get('pileta', '').lower() == 'si':
                            amenities_match += 1
                    elif amenity in ['cochera']:
                        if propiedad.get('cochera', '').lower() == 'x':
                            amenities_match += 1
                    elif amenity in ['balcon']:
                        if propiedad.get('balcon', '').lower() == 'x':
                            amenities_match += 1
                    elif amenity in ['aire']:
                        if propiedad.get('aire_acondicionado', '').lower() == 'si':
                            amenities_match += 1
                    elif amenity in ['mascotas']:
                        if propiedad.get('acepta_mascotas', '').lower() == 'si':
                            amenities_match += 1
                
                if amenities_match > 0:
                    score += amenities_match * 2
            
            # Buscar coincidencias en texto libre
            if query.texto_libre:
                texto_comparar = f"{propiedad.get('titulo', '')} {propiedad.get('descripcion', '')} {propiedad.get('direccion', '')}".lower()
                palabras = query.texto_libre.split()
                for palabra in palabras:
                    if len(palabra) > 3 and palabra in texto_comparar:
                        score += 1
            
            # Solo incluir propiedades con score > 0
            if score > 0:
                propiedad['relevance_score'] = score
                results.append(propiedad)
        
        # Ordenar por relevancia
        results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        return results

# =============================================================================
# 📱 GENERADOR DE RESPUESTAS WHATSAPP
# =============================================================================

class WhatsAppResponseGenerator:
    """Genera respuestas formateadas para WhatsApp"""
    
    def __init__(self):
        self.contact_info = "📞 +54 11 2536-8595"
        self.company_name = "Dante Propiedades"
        self.website_url = "https://tu-usuario.github.io/tu-repositorio/"
    
    def format_property_message(self, propiedad: Dict) -> str:
        """Formatea una propiedad para respuesta de WhatsApp"""
        titulo = propiedad.get('titulo', 'Propiedad')
        barrio = propiedad.get('barrio', '')
        precio = propiedad.get('precio', 0)
        ambientes = propiedad.get('ambientes', 0)
        metros = propiedad.get('metros_cuadrados', 0)
        tipo = propiedad.get('tipo', '')
        operacion = propiedad.get('operacion', '')
        direccion = propiedad.get('direccion', '')
        
        # Formatear precio
        moneda = propiedad.get('moneda_precio', 'USD')
        precio_formatted = f"${precio:,} {moneda}"
        
        # Crear mensaje
        message = f"🏠 *{titulo}*\n\n"
        message += f"📍 *Ubicación:* {barrio}\n"
        message += f"🏷️ *Precio:* {precio_formatted}\n"
        message += f"🛏️ *Ambientes:* {ambientes}\n"
        message += f"📐 *Superficie:* {metros} m²\n"
        message += f"🏢 *Tipo:* {tipo.title()}\n"
        message += f"💰 *Operación:* {operacion.title()}\n\n"
        
        if direccion:
            message += f"🗺️ *Dirección:* {direccion}\n\n"
        
        # Agregar amenities destacadas
        amenities = []
        if propiedad.get('pileta', '').lower() == 'si':
            amenities.append("🏊 Pileta")
        if propiedad.get('cochera', '').lower() == 'x':
            amenities.append("🚗 Cochera")
        if propiedad.get('balcon', '').lower() == 'x':
            amenities.append("🏞️ Balcón")
        if propiedad.get('aire_acondicionado', '').lower() == 'si':
            amenities.append("❄️ Aire Acondicionado")
        if propiedad.get('acepta_mascotas', '').lower() == 'si':
            amenities.append("🐕 Acepta Mascotas")
        
        if amenities:
            message += "✨ *Amenidades:*\n" + "\n".join(amenities) + "\n\n"
        
        # Agregar descripción breve
        descripcion = propiedad.get('descripcion', '')
        if descripcion:
            message += f"📝 *Descripción:* {descripcion[:100]}...\n\n"
        
        # Agregar foto principal
        fotos = propiedad.get('fotos', [])
        if fotos:
            message += f"📸 *Fotos:* {len(fotos)} imágenes disponibles\n\n"
        
        # Agregar CTA
        message += f"💬 *¿Te interesa?*\n"
        message += f"Responde con un número para ver más detalles\n\n"
        message += f"🏢 {self.company_name}\n"
        message += f"{self.contact_info}"
        
        return message
    
    def format_search_results_message(self, propiedades: List[Dict], query_info: str = "") -> str:
        """Formatea múltiples resultados de búsqueda"""
        if not propiedades:
            return self.format_no_results_message(query_info)
        
        message = f"🔍 *Resultados de búsqueda*\n\n"
        if query_info:
            message += f"📋 *Consulta:* {query_info}\n\n"
        
        message += f"📊 *Encontré {len(propiedades)} propiedades*\n\n"
        
        # Mostrar máximo 3 propiedades principales
        max_props = min(3, len(propiedades))
        for i, propiedad in enumerate(propiedades[:max_props], 1):
            titulo = propiedad.get('titulo', 'Propiedad')
            precio = f"${propiedad.get('precio', 0):,} {propiedad.get('moneda_precio', 'USD')}"
            barrio = propiedad.get('barrio', '')
            
            message += f"*{i}. {titulo}*\n"
            message += f"💰 {precio} | 📍 {barrio}\n"
            message += f"🏠 {propiedad.get('ambientes', 0)} amb | 📐 {propiedad.get('metros_cuadrados', 0)} m²\n\n"
        
        if len(propiedades) > max_props:
            message += f"📝 *Y {len(propiedades) - max_props} propiedades más...*\n\n"
        
        message += f"💬 *Para ver detalles completos, responde:*\n"
        message += f"- El número de la propiedad (1, 2, 3...)\n"
        message += f"- 'Todas' para ver todos los resultados\n"
        message += f"- 'Más' para más opciones\n\n"
        message += f"🏢 {self.company_name}\n"
        message += f"{self.contact_info}"
        
        return message
    
    def format_no_results_message(self, query_info: str = "") -> str:
        """Formatea mensaje cuando no hay resultados"""
        message = "😅 *No encontré propiedades*\n\n"
        
        if query_info:
            message += f"📋 *Tu búsqueda:* {query_info}\n\n"
        
        message += "💡 *Sugerencias:*\n"
        message += "• Amplía el rango de precios\n"
        message += "• Busca en otros barrios\n"
        message += "• Cambia el tipo de propiedad\n"
        message += "• Consulta disponibilidad actual\n\n"
        
        message += f"🏢 {self.company_name}\n"
        message += f"{self.contact_info}"
        
        return message
    
    def format_welcome_message(self) -> str:
        """Formatea mensaje de bienvenida"""
        return (
            f"🏠 ¡Hola! Soy el asistente virtual de *{self.company_name}*\n\n"
            f"🔍 *Te ayudo a encontrar la propiedad ideal:*\n\n"
            f"• 🏙️ *Por ubicación:* 'departamentos en Palermo'\n"
            f"• 💰 *Por precio:* 'hasta 150k USD'\n"
            f"• 🏢 *Por tipo:* 'monoambientes en microcentro'\n"
            f"• 🛏️ *Por ambientes:* '3 ambientes'\n"
            f"• ✨ *Por amenidades:* 'pileta y cochera'\n\n"
            f"💬 *Ejemplos:*\n"
            f"'Busco casa en Parque Avellaneda'\n"
            f"'Monoambientes hasta 100k USD'\n"
            f"'Departamentos en Palermo con pileta'\n\n"
            f"¿En qué te ayudo hoy? 😊\n\n"
            f"🏢 {self.company_name}\n"
            f"{self.contact_info}"
        )

# =============================================================================
# 🤖 MANEJADOR PRINCIPAL DE CHATBOT
# =============================================================================

class WhatsAppChatbot:
    """Manejador principal del chatbot de WhatsApp"""
    
    def __init__(self, propiedades_file: str):
        self.ai = ChatbotAI(propiedades_file)
        self.response_generator = WhatsAppResponseGenerator()
        self.conversation_state = {}  # Para manejar estado de conversación
    
    def process_message(self, message: str, phone_number: str) -> str:
        """Procesa un mensaje y devuelve la respuesta"""
        
        # Normalizar mensaje
        message = message.strip()
        
        # Detectar comando especial
        if self._is_welcome_command(message):
            return self.response_generator.format_welcome_message()
        
        # Parsear consulta
        query = self.ai.parse_query(message)
        
        # Buscar propiedades
        resultados = self.ai.search_properties(query)
        
        # Generar respuesta
        if not resultados:
            return self.response_generator.format_no_results_message(message)
        
        # Si hay muchos resultados, mostrar resumen
        if len(resultados) > 1:
            return self.response_generator.format_search_results_message(resultados, message)
        else:
            # Mostrar propiedad completa
            return self.response_generator.format_property_message(resultados[0])
    
    def _is_welcome_command(self, message: str) -> bool:
        """Detecta si es un comando de bienvenida/ayuda"""
        welcome_commands = ['hola', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 
                          'ayuda', 'help', 'menu', 'menú', 'start', 'inicio']
        message_lower = message.lower()
        return any(cmd in message_lower for cmd in welcome_commands)

# =============================================================================
# 🌐 APLICACIÓN FLASK PARA WEBHOOK
# =============================================================================

app = Flask(__name__)
CORS(app)  # Permitir CORS para desarrollo

# Instanciar chatbot
chatbot = WhatsAppChatbot('propiedades.json')

@app.route('/webhook', methods=['POST'])
def whatsapp_webhook():
    """Webhook para recibir mensajes de WhatsApp"""
    try:
        # Obtener datos del webhook (formato genérico)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data received'}), 400
        
        # Extraer mensaje y número (formato puede variar según el proveedor)
        message = data.get('message', '').strip()
        phone_number = data.get('from', 'unknown')
        
        if not message:
            return jsonify({'status': 'No message provided'}), 400
        
        # Procesar mensaje con el chatbot
        response = chatbot.process_message(message, phone_number)
        
        # Aquí iría la lógica para enviar la respuesta via WhatsApp API
        # Por ahora retornamos la respuesta para debug
        
        print(f"📱 Mensaje recibido de {phone_number}: {message}")
        print(f"🤖 Respuesta generada: {response[:100]}...")
        
        return jsonify({
            'status': 'success',
            'response': response,
            'phone_number': phone_number
        })
        
    except Exception as e:
        print(f"❌ Error en webhook: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud"""
    return jsonify({
        'status': 'healthy',
        'chatbot': 'active',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/search', methods=['GET'])
def search_properties_api():
    """API para búsqueda de propiedades (web)"""
    try:
        query_text = request.args.get('q', '').strip()
        if not query_text:
            return jsonify({'error': 'Query parameter "q" is required'}), 400
        
        # Parsear consulta
        query = chatbot.ai.parse_query(query_text)
        
        # Buscar propiedades
        resultados = chatbot.ai.search_properties(query)
        
        # Preparar respuesta
        results_data = []
        for prop in resultados[:10]:  # Limitar a 10 resultados
            results_data.append({
                'id': prop.get('id_temporal'),
                'titulo': prop.get('titulo'),
                'barrio': prop.get('barrio'),
                'precio': prop.get('precio'),
                'moneda': prop.get('moneda_precio'),
                'ambientes': prop.get('ambientes'),
                'metros': prop.get('metros_cuadrados'),
                'tipo': prop.get('tipo'),
                'operacion': prop.get('operacion'),
                'fotos': prop.get('fotos', [])[:3]  # Solo primeras 3 fotos
            })
        
        return jsonify({
            'query': query_text,
            'total_results': len(resultados),
            'results': results_data
        })
        
    except Exception as e:
        print(f"❌ Error en búsqueda API: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """Página principal de la API"""
    return jsonify({
        'message': '🤖 WhatsApp Chatbot API - Dante Propiedades',
        'version': '1.0.0',
        'endpoints': {
            '/webhook': 'POST - Webhook de WhatsApp',
            '/search': 'GET - Búsqueda de propiedades',
            '/health': 'GET - Verificación de salud'
        }
    })

if __name__ == '__main__':
    print("🚀 Iniciando Chatbot WhatsApp de Dante Propiedades...")
    print("🤖 Motor de IA cargado")
    print("📱 Webhook configurado")
    print("🌐 Servidor listo en puerto 5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)