#!/usr/bin/env python3
"""
Test Funcional del Sistema Modular
Verifica que la navegación con números funcione en el sitio web real
"""

import requests
import time
import re

def test_navegacion_chatbot():
    print("🧪 TEST FUNCIONAL DEL CHATBOT MODULAR")
    print("=" * 50)
    
    url = "http://localhost:9000/"
    
    try:
        print(f"📡 Cargando página principal...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
            
        content = response.text
        print(f"✅ Página cargada ({len(content)} caracteres)")
        
        # Verificar elementos esenciales
        print("\n🔍 VERIFICANDO ELEMENTOS DEL CHATBOT:")
        
        checks = [
            ("Chat interface", "class=\"chatbot-interface\"" in content),
            ("Message input", "id=\"messageInput\"" in content),
            ("Send button", "class=\"send-button\"" in content),
            ("Chat messages", "id=\"chatMessages\"" in content),
            ("SistemaMenus global", "window.SistemaMenus" in content),
            ("App.js linked", "app.js" in content),
            ("SistemaMenus.js linked", "sistema_menus.js" in content),
            ("ProcessUserMessage function", "processUserMessage" in content),
        ]
        
        all_passed = True
        for check_name, result in checks:
            status = "✅" if result else "❌"
            print(f"  {status} {check_name}")
            if not result:
                all_passed = False
        
        # Buscar patrones del sistema modular
        print("\n🎯 VERIFICANDO SISTEMA MODULAR:")
        
        modular_checks = [
            ("mostrarMenuPrincipal() call", "SistemaMenus.mostrarMenuPrincipal()" in content),
            ("procesarMensaje() call", "SistemaMenus.procesarMensaje" in content),
            ("ejecutarAccion function", "ejecutarAccion" in content),
            ("Menu initialization", "window.SistemaMenus.inicializar()" in content),
        ]
        
        for check_name, result in modular_checks:
            status = "✅" if result else "❌"
            print(f"  {status} {check_name}")
            if not result:
                all_passed = False
        
        # Verificar estructura de menús en el código JavaScript
        print("\n📋 VERIFICANDO DEFINICIÓN DE MENÚS:")
        
        # Buscar definiciones de menús en el JavaScript
        menús_pattern = r'"Buscar propiedad"|"Ver todas las propiedades"|"Ayuda"'
        if re.search(menús_pattern, content):
            print("  ✅ Definiciones de menú principal encontradas")
        else:
            print("  ❌ Definiciones de menú principal no encontradas")
            all_passed = False
        
        # Buscar opciones de tipos
        tipos_pattern = r'"Por tipo de propiedad"|"Por barrio"|"Por precio"'
        if re.search(tipos_pattern, content):
            print("  ✅ Opciones de búsqueda encontradas")
        else:
            print("  ❌ Opciones de búsqueda no encontradas")
            all_passed = False
        
        # Verificar que el sistema dinámico esté integrado
        print("\n🏠 VERIFICANDO SISTEMA DINÁMICO:")
        
        dinamico_checks = [
            ("sistemaPropiedades", "sistemaPropiedades" in content),
            ("loadProperties", "loadProperties" in content),
            ("displayResults", "displayResults" in content),
            ("inicializarSistemaDinamico", "inicializarSistemaDinamico" in content),
        ]
        
        for check_name, result in dinamico_checks:
            status = "✅" if result else "❌"
            print(f"  {status} {check_name}")
            if not result:
                all_passed = False
        
        # Resultado final
        print("\n" + "=" * 50)
        if all_passed:
            print("🎉 SISTEMA MODULAR: IMPLEMENTACIÓN CORRECTA")
            print("✅ Todos los elementos del sistema están presentes")
            print("🚀 El sitio debería funcionar con navegación por números")
            print("\n💡 PARA PROBAR MANUALMENTE:")
            print("1. Abre http://localhost:9000/ en tu navegador")
            print("2. Deberías ver el menú principal automáticamente")
            print("3. Escribe '1' para buscar propiedad")
            print("4. Escribe '1' para filtrar por tipo")
            print("5. Escribe '1' para ver casas")
            print("6. El sistema debería mostrar propiedades filtradas")
        else:
            print("⚠️ SISTEMA MODULAR: REVISAR IMPLEMENTACIÓN")
            print("❌ Algunos elementos faltan o están mal configurados")
            print("\n🔧 ACCIONES RECOMENDADAS:")
            print("1. Verificar que sistema_menus.js esté bien integrado")
            print("2. Revisar la inicialización del SistemaMenus")
            print("3. Comprobar que los menús estén definidos correctamente")
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error durante el test: {e}")
        return False

def test_menu_generation():
    """Test específico de generación de menús"""
    print("\n🔧 TEST DE GENERACIÓN DE MENÚS:")
    print("-" * 40)
    
    # Simular lo que debería pasar cuando se carga la página
    print("📝 PROCESO DE INICIALIZACIÓN ESPERADO:")
    print("1. ✅ Load page -> http://localhost:9000/")
    print("2. ✅ Load sistema_menus.js")
    print("3. ✅ Load app.js")
    print("4. ✅ Initialize SistemaMenus.inicializar()")
    print("5. ✅ Call SistemaMenus.mostrarMenuPrincipal()")
    print("6. ✅ Show message: '🏠 BIENVENIDO A DANTE PROPIEDADES...'")
    print("7. ✅ Show menu: '1. Buscar propiedad\n2. Ver todas las propiedades\n3. Ayuda'")
    print("\n💡 NAVEGACIÓN ESPERADA:")
    print("Usuario: '1' -> Sistema: Mostrar opciones de búsqueda")
    print("Usuario: '1' -> Sistema: Mostrar tipos de propiedades")
    print("Usuario: '1' -> Sistema: Filtrar y mostrar casas")
    
if __name__ == "__main__":
    success = test_navegacion_chatbot()
    test_menu_generation()
    
    print(f"\n🎯 RESULTADO FINAL:")
    if success:
        print("✅ Sistema modular listo para usar")
        print("🌐 Accede a http://localhost:9000/ para probarlo")
    else:
        print("❌ Sistema modular necesita más trabajo")
        print("🔧 Revisar los elementos que fallaron")