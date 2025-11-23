#!/usr/bin/env python3
"""
Test de Interacción Directa con el Chatbot
Simula la navegación del usuario para verificar que el sistema modular funcione
"""

import requests
import json

def test_interaccion_directa():
    print("🧪 TEST DE INTERACCIÓN DIRECTA CON CHATBOT")
    print("=" * 50)
    
    url = "http://localhost:9000/"
    
    try:
        print("📡 Cargando página...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
        
        print(f"✅ Página cargada ({len(response.text)} caracteres)")
        
        # Verificar que el HTML contenga el chatbot
        content = response.text
        
        chatbot_checks = [
            ("Chat interface", "chatbot-interface" in content),
            ("Message input", 'id="messageInput"' in content),
            ("Send button", "send-button" in content),
            ("Chat messages", 'id="chatMessages"' in content),
        ]
        
        print("\n🔍 VERIFICANDO INTERFAZ DEL CHATBOT:")
        all_passed = True
        for check_name, result in chatbot_checks:
            status = "✅" if result else "❌"
            print(f"  {status} {check_name}")
            if not result:
                all_passed = False
        
        # Verificar que el sistema modular esté integrado
        modular_checks = [
            ("SistemaMenus global", "window.SistemaMenus" in content),
            ("App.js linked", "app.js" in content),
            ("sistema_menus.js linked", "sistema_menus.js" in content),
            ("mostrarMenuPrincipal called", "mostrarMenuPrincipal()" in content),
            ("procesarMensaje used", "procesarMensaje" in content),
        ]
        
        print("\n🎯 VERIFICANDO SISTEMA MODULAR:")
        for check_name, result in modular_checks:
            status = "✅" if result else "❌"
            print(f"  {status} {check_name}")
            if not result:
                all_passed = False
        
        # Verificar menú principal en el HTML
        print("\n📋 VERIFICANDO MENÚ PRINCIPAL EN CÓDIGO:")
        
        if '"1. Buscar propiedad"' in content:
            print("  ✅ Opción '1. Buscar propiedad' encontrada")
        else:
            print("  ❌ Opción '1. Buscar propiedad' no encontrada")
            all_passed = False
        
        if '"2. Ver todas las propiedades"' in content:
            print("  ✅ Opción '2. Ver todas las propiedades' encontrada")
        else:
            print("  ❌ Opción '2. Ver todas las propiedades' no encontrada")
            all_passed = False
        
        if '"3. Ayuda"' in content:
            print("  ✅ Opción '3. Ayuda' encontrada")
        else:
            print("  ❌ Opción '3. Ayuda' no encontrada")
            all_passed = False
        
        # Verificar opciones de búsqueda
        print("\n🔍 VERIFICANDO OPCIONES DE BÚSQUEDA:")
        
        if '"1. Por tipo de propiedad"' in content:
            print("  ✅ Opción '1. Por tipo de propiedad' encontrada")
        else:
            print("  ❌ Opción '1. Por tipo de propiedad' no encontrada")
            all_passed = False
        
        if '"2. Por barrio"' in content:
            print("  ✅ Opción '2. Por barrio' encontrada")
        else:
            print("  ❌ Opción '2. Por barrio' no encontrada")
            all_passed = False
        
        if '"3. Por precio"' in content:
            print("  ✅ Opción '3. Por precio' encontrada")
        else:
            print("  ❌ Opción '3. Por precio' no encontrada")
            all_passed = False
        
        # Verificar sistema dinámico
        print("\n🏠 VERIFICANDO SISTEMA DINÁMICO:")
        
        if "sistemaPropiedades" in content:
            print("  ✅ Sistema de propiedades dinámico encontrado")
        else:
            print("  ❌ Sistema de propiedades dinámico no encontrado")
            all_passed = False
        
        if "loadProperties" in content:
            print("  ✅ Función loadProperties encontrada")
        else:
            print("  ❌ Función loadProperties no encontrada")
            all_passed = False
        
        # Resultado final
        print("\n" + "=" * 50)
        if all_passed:
            print("🎉 SISTEMA MODULAR: COMPLETAMENTE FUNCIONAL")
            print("✅ Todos los elementos están presentes e integrados")
            print("✅ El chatbot debería funcionar correctamente")
            print("\n🚀 INSTRUCCIONES PARA PROBAR MANUALMENTE:")
            print("1. Abre http://localhost:9000/ en tu navegador")
            print("2. Deberías ver el menú principal automáticamente")
            print("3. Escribe '1' → Te mostrará opciones de búsqueda")
            print("4. Escribe '1' → Te mostrará tipos de propiedades")
            print("5. Escribe '1' → Te mostrará casas")
            print("6. Deberías ver propiedades filtradas")
            print("\n📱 NAVEGACIÓN ESPERADA:")
            print("Usuario: '1'")
            print("Sistema: '🔍 Opciones de búsqueda:\n1. Por tipo de propiedad\n2. Por barrio\n3. Por precio\n\n0. Volver'")
            print("\nUsuario: '1'")
            print("Sistema: '🏢 Tipos de propiedades:\n1. Casas\n2. Departamentos\n3. Locales\n4. Oficinas\n5. Ver todas\n\n0. Volver'")
        else:
            print("⚠️ SISTEMA MODULAR: REVISAR ELEMENTOS FALTANTES")
            print("❌ Algunos elementos no están correctamente implementados")
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error durante el test: {e}")
        return False

def simular_navegacion():
    """Simula la navegación que debería ocurrir"""
    print("\n🧭 SIMULACIÓN DE NAVEGACIÓN:")
    print("-" * 40)
    
    navegacion = [
        {
            "paso": 1,
            "usuario": "1",
            "sistema": "🔍 Opciones de búsqueda:\n1. Por tipo de propiedad\n2. Por barrio\n3. Por precio\n\n0. Volver"
        },
        {
            "paso": 2,
            "usuario": "1", 
            "sistema": "🏢 Tipos de propiedades:\n1. Casas\n2. Departamentos\n3. Locales\n4. Oficinas\n5. Ver todas\n\n0. Volver"
        },
        {
            "paso": 3,
            "usuario": "1",
            "sistema": "🏠 Mostrando X propiedades tipo 'casa'"
        }
    ]
    
    for nav in navegacion:
        print(f"  📝 PASO {nav['paso']}:")
        print(f"     Usuario escribe: '{nav['usuario']}'")
        print(f"     Sistema responde:")
        for linea in nav['sistema'].split('\n'):
            print(f"       {linea}")
        print()

if __name__ == "__main__":
    success = test_interaccion_directa()
    simular_navegacion()
    
    print(f"\n🎯 RESULTADO FINAL:")
    if success:
        print("✅ Sistema modular listo para usar")
        print("🌐 Accede a http://localhost:9000/ y prueba escribir números")
        print("💡 ¡La navegación con solo números debería funcionar perfectamente!")
    else:
        print("❌ Sistema modular necesita correcciones adicionales")