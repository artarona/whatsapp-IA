// ===== SISTEMA DE NAVEGACIÓN MODULAR =====

class MenuSystem {
    constructor() {
        this.currentMenu = 'principal';
        this.menuHistory = [];
        this.callbacks = {};
        this.menus = this.initializeMenus();
        
        ConfigUtils.info('Sistema de menús inicializado');
    }

    // Inicializar todos los menús disponibles
    initializeMenus() {
        const filters = PropertyManager.getAvailableFilters();
        
        return {
            principal: {
                title: "🏠 Menú Principal - Dante Propiedades",
                description: "Selecciona una opción para continuar",
                options: [
                    {
                        number: 1,
                        text: "🔍 Buscar Propiedades",
                        description: "Encuentra propiedades por criterios específicos",
                        action: "BUSCAR"
                    },
                    {
                        number: 2,
                        text: "📋 Ver Todas las Propiedades",
                        description: "Mostrar todas las propiedades disponibles",
                        action: "VER_TODAS"
                    },
                    {
                        number: 3,
                        text: "🏢 Por Tipo de Propiedad",
                        description: "Filtrar por casa, departamento, oficina, etc.",
                        action: "POR_TIPO"
                    },
                    {
                        number: 4,
                        text: "📍 Por Barrio",
                        description: "Explorar propiedades por ubicación",
                        action: "POR_BARRIO"
                    },
                    {
                        number: 5,
                        text: "💰 Por Precio",
                        description: "Buscar por rango de precios",
                        action: "POR_PRECIO"
                    },
                    {
                        number: 6,
                        text: "📊 Estadísticas",
                        description: "Ver información del inventario",
                        action: "ESTADISTICAS"
                    },
                    {
                        number: 7,
                        text: "💬 Contactar",
                        description: "Información de contacto",
                        action: "CONTACTAR"
                    },
                    {
                        number: 0,
                        text: "❓ Ayuda",
                        description: "Obtener ayuda sobre el sistema",
                        action: "AYUDA"
                    }
                ]
            },

            busqueda: {
                title: "🔍 Búsqueda de Propiedades",
                description: "Usa lenguaje natural para describir lo que buscas",
                options: [
                    {
                        number: 1,
                        text: "Ejemplo: 'departamentos en Palermo hasta 200k'",
                        description: "Búsqueda por texto libre",
                        action: "BUSQUEDA_LIBRE"
                    },
                    {
                        number: 2,
                        text: "🗺️ Por Barrio Específico",
                        description: "Seleccionar un barrio en particular",
                        action: "BARRIO_SELECCIONAR"
                    },
                    {
                        number: 3,
                        text: "💵 Por Rango de Precio",
                        description: "Establecer precio mínimo y máximo",
                        action: "PRECIO_SELECCIONAR"
                    },
                    {
                        number: 4,
                        text: "🏠 Por Tipo y Ambientes",
                        description: "Ej: 'casa 3 ambientes'",
                        action: "TIPO_AMBIENTES"
                    },
                    {
                        number: 0,
                        text: "⬅️ Volver al Menú Principal",
                        description: "Regresar al menú anterior",
                        action: "VOLVER"
                    }
                ]
            },

            tipos: {
                title: "🏢 Tipos de Propiedades",
                description: "Selecciona el tipo de propiedad que te interesa",
                options: filters.tipos.map((tipo, index) => ({
                    number: index + 1,
                    text: this.getTypeIcon(tipo) + " " + Utils.String.titleCase(tipo),
                    description: `Ver ${tipo}s disponibles`,
                    action: "FILTRAR_TIPO",
                    value: tipo
                })).concat([
                    {
                        number: 0,
                        text: "⬅️ Volver al Menú Principal",
                        description: "Regresar al menú anterior",
                        action: "VOLVER"
                    }
                ])
            },

            barrios: {
                title: "📍 Barrios Disponibles",
                description: "Explora propiedades por ubicación",
                options: filters.barrios.map((barrio, index) => ({
                    number: index + 1,
                    text: "📍 " + barrio,
                    description: `Ver propiedades en ${barrio}`,
                    action: "FILTRAR_BARRIO",
                    value: barrio
                })).concat([
                    {
                        number: 0,
                        text: "⬅️ Volver al Menú Principal",
                        description: "Regresar al menú anterior",
                        action: "VOLVER"
                    }
                ])
            },

            precios: {
                title: "💰 Rangos de Precio",
                description: "Selecciona el rango de precios que prefieres",
                options: AppConfig.search.priceRanges.map((range, index) => ({
                    number: index + 1,
                    text: "💵 " + range.label,
                    description: `Propiedades entre $${range.min.toLocaleString()} y ${range.max === Infinity ? '∞' : '$' + range.max.toLocaleString()}`,
                    action: "FILTRAR_PRECIO",
                    value: range
                })).concat([
                    {
                        number: 0,
                        text: "⬅️ Volver al Menú Principal",
                        description: "Regresar al menú anterior",
                        action: "VOLVER"
                    }
                ])
            },

            estadisticas: {
                title: "📊 Estadísticas del Inventario",
                description: "Información general de las propiedades",
                options: [
                    {
                        number: 1,
                        text: "📈 Total de Propiedades",
                        description: "Ver cantidad total disponible",
                        action: "STAT_TOTAL"
                    },
                    {
                        number: 2,
                        text: "🏢 Por Tipo",
                        description: "Distribución por tipo de propiedad",
                        action: "STAT_TIPOS"
                    },
                    {
                        number: 3,
                        text: "📍 Por Barrio",
                        description: "Distribución por ubicación",
                        action: "STAT_BARRIOS"
                    },
                    {
                        number: 4,
                        text: "💰 Análisis de Precios",
                        description: "Estadísticas de precios",
                        action: "STAT_PRECIOS"
                    },
                    {
                        number: 0,
                        text: "⬅️ Volver al Menú Principal",
                        description: "Regresar al menú anterior",
                        action: "VOLVER"
                    }
                ]
            },

            ayuda: {
                title: "❓ Ayuda del Sistema",
                description: "Aprende a usar el sistema de navegación",
                options: [
                    {
                        number: 1,
                        text: "🎯 Cómo navegar",
                        description: "Explicación del sistema de menús",
                        action: "AYUDA_NAVEGACION"
                    },
                    {
                        number: 2,
                        text: "🔍 Búsqueda por texto",
                        description: "Cómo usar lenguaje natural",
                        action: "AYUDA_BUSQUEDA"
                    },
                    {
                        number: 3,
                        text: "💬 Chatbot inteligente",
                        description: "Características del asistente",
                        action: "AYUDA_CHATBOT"
                    },
                    {
                        number: 4,
                        text: "📞 Contacto",
                        description: "Información de contacto",
                        action: "CONTACTAR"
                    },
                    {
                        number: 0,
                        text: "⬅️ Volver al Menú Principal",
                        description: "Regresar al menú anterior",
                        action: "VOLVER"
                    }
                ]
            }
        };
    }

    // Obtener icono para tipo de propiedad
    getTypeIcon(tipo) {
        const icons = {
            'casa': '🏠',
            'departamento': '🏢',
            'monoambiente': '🏠',
            'oficina': '🏬',
            'local': '🏪',
            'terreno': '🌍',
            'ph': '🏛️',
            'dúplex': '🏗️',
            'loft': '🏭'
        };
        
        return icons[tipo.toLowerCase()] || '🏘️';
    }

    // Mostrar menú específico
    showMenu(menuKey) {
        if (!this.menus[menuKey]) {
            ConfigUtils.warn(`Menú '${menuKey}' no encontrado`);
            return this.showMenu('principal');
        }

        this.menuHistory.push(this.currentMenu);
        this.currentMenu = menuKey;
        
        const menu = this.menus[menuKey];
        return this.formatMenu(menu);
    }

    // Formatear menú para mostrar
    formatMenu(menu) {
        let formatted = `**${menu.title}**\n\n`;
        formatted += `${menu.description}\n\n`;
        
        menu.options.forEach(option => {
            formatted += `**${option.number}.** ${option.text}\n`;
            formatted += `   *${option.description}*\n\n`;
        });
        
        formatted += "Escribe solo el número de tu opción:";
        
        return formatted;
    }

    // Procesar respuesta del usuario
    processResponse(response) {
        const userInput = Utils.String.clean(response.toString());
        
        // Si es un número, procesar como selección de menú
        if (Utils.Number.isNumber(userInput)) {
            return this.processMenuSelection(parseInt(userInput));
        }
        
        // Si es texto, procesar como búsqueda o comando
        return this.processTextInput(userInput);
    }

    // Procesar selección de menú
    processMenuSelection(number) {
        const currentMenu = this.menus[this.currentMenu];
        if (!currentMenu) {
            return {
                error: 'Menú actual no encontrado',
                content: 'Error: Menú no encontrado'
            };
        }

        const option = currentMenu.options.find(opt => opt.number === number);
        
        if (!option) {
            return {
                error: `Opción ${number} no válida`,
                content: `❌ La opción ${number} no está disponible.\n\nIntenta con una opción válida del menú.`
            };
        }

        // Ejecutar acción
        return this.executeAction(option);
    }

    // Procesar entrada de texto
    processTextInput(text) {
        const lowerText = text.toLowerCase();
        
        // Comandos especiales
        if (lowerText === 'volver' || lowerText === 'atrás' || lowerText === 'menu') {
            return this.goBack();
        }
        
        if (lowerText === 'ayuda' || lowerText === 'help') {
            return this.showMenu('ayuda');
        }
        
        if (lowerText === 'estadisticas' || lowerText === 'stats') {
            return this.showMenu('estadisticas');
        }
        
        if (lowerText === 'todas' || lowerText === 'ver todas') {
            return {
                action: { type: 'MOSTRAR_TODAS' },
                content: 'Mostrando todas las propiedades...'
            };
        }
        
        // Procesar como búsqueda por texto libre
        return this.processNaturalLanguageSearch(text);
    }

    // Procesar búsqueda por lenguaje natural
    processNaturalLanguageSearch(query) {
        return {
            action: { 
                type: 'BUSQUEDA_TEXTO', 
                query: query 
            },
            content: `🔍 Buscando propiedades para: "${query}"...`
        };
    }

    // Ejecutar acción de menú
    executeAction(option) {
        const action = option.action;
        
        switch (action) {
            case 'BUSCAR':
                return {
                    action: { type: 'MOSTRAR_MENU', menu: 'busqueda' },
                    content: this.formatMenu(this.menus['busqueda'])
                };
                
            case 'VER_TODAS':
                return {
                    action: { type: 'MOSTRAR_TODAS' },
                    content: 'Mostrando todas las propiedades disponibles...'
                };
                
            case 'POR_TIPO':
                return {
                    action: { type: 'MOSTRAR_MENU', menu: 'tipos' },
                    content: this.formatMenu(this.menus['tipos'])
                };
                
            case 'POR_BARRIO':
                return {
                    action: { type: 'MOSTRAR_MENU', menu: 'barrios' },
                    content: this.formatMenu(this.menus['barrios'])
                };
                
            case 'POR_PRECIO':
                return {
                    action: { type: 'MOSTRAR_MENU', menu: 'precios' },
                    content: this.formatMenu(this.menus['precios'])
                };
                
            case 'FILTRAR_TIPO':
                return {
                    action: { 
                        type: 'FILTRAR', 
                        filterType: 'tipo', 
                        value: option.value 
                    },
                    content: `Filtrando por tipo: ${option.value}`
                };
                
            case 'FILTRAR_BARRIO':
                return {
                    action: { 
                        type: 'FILTRAR', 
                        filterType: 'barrio', 
                        value: option.value 
                    },
                    content: `Filtrando por barrio: ${option.value}`
                };
                
            case 'FILTRAR_PRECIO':
                return {
                    action: { 
                        type: 'FILTRAR', 
                        filterType: 'precio', 
                        value: option.value 
                    },
                    content: `Filtrando por precio: ${option.value.label}`
                };
                
            case 'ESTADISTICAS':
                return {
                    action: { type: 'MOSTRAR_MENU', menu: 'estadisticas' },
                    content: this.formatMenu(this.menus['estadisticas'])
                };
                
            case 'STAT_TOTAL':
                return this.showStatistics('total');
                
            case 'STAT_TIPOS':
                return this.showStatistics('tipos');
                
            case 'STAT_BARRIOS':
                return this.showStatistics('barrios');
                
            case 'STAT_PRECIOS':
                return this.showStatistics('precios');
                
            case 'CONTACTAR':
                return this.showContactInfo();
                
            case 'AYUDA':
                return {
                    action: { type: 'MOSTRAR_MENU', menu: 'ayuda' },
                    content: this.formatMenu(this.menus['ayuda'])
                };
                
            case 'VOLVER':
                return this.goBack();
                
            case 'BUSQUEDA_LIBRE':
                return {
                    action: { type: 'BUSQUEDA_LIBRE' },
                    content: 'Escribe tu búsqueda en lenguaje natural. Ejemplo: "departamentos en Palermo hasta 200k con pileta"'
                };
                
            case 'AYUDA_NAVEGACION':
                return this.showHelpNavigation();
                
            case 'AYUDA_BUSQUEDA':
                return this.showHelpSearch();
                
            case 'AYUDA_CHATBOT':
                return this.showHelpChatbot();
                
            default:
                return {
                    error: `Acción '${action}' no implementada`,
                    content: '❌ Esta opción aún no está disponible.'
                };
        }
    }

    // Mostrar estadísticas
    showStatistics(type) {
        const stats = PropertyManager.getInventoryStats();
        
        let content = `📊 **Estadísticas del Inventario**\n\n`;
        
        switch (type) {
            case 'total':
                content += `**Total de Propiedades:** ${stats.total}\n\n`;
                content += `**Operaciones Disponibles:**\n`;
                Object.entries(stats.porOperacion).forEach(([op, count]) => {
                    content += `• ${Utils.String.titleCase(op)}: ${count}\n`;
                });
                break;
                
            case 'tipos':
                content += `**Distribución por Tipo:**\n\n`;
                Object.entries(stats.porTipo)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([tipo, count]) => {
                        const percentage = ((count / stats.total) * 100).toFixed(1);
                        content += `• ${Utils.String.titleCase(tipo)}: ${count} (${percentage}%)\n`;
                    });
                break;
                
            case 'barrios':
                content += `**Distribución por Barrio:**\n\n`;
                Object.entries(stats.porBarrio)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([barrio, count]) => {
                        const percentage = ((count / stats.total) * 100).toFixed(1);
                        content += `• ${barrio}: ${count} (${percentage}%)\n`;
                    });
                break;
                
            case 'precios':
                content += `**Análisis de Precios:**\n\n`;
                content += `• **Precio Promedio:** ${Utils.Number.formatCurrency(stats.precioPromedio)}\n`;
                content += `• **Ambientes Promedio:** ${stats.ambientesPromedio.toFixed(1)}\n`;
                content += `• **Metros Promedio:** ${stats.metrosPromedio.toFixed(0)} m²\n`;
                break;
        }
        
        content += `\n*Para ver más detalles, selecciona otra opción del menú.*`;
        
        return {
            action: { type: 'STATISTICS', statsType: type },
            content
        };
    }

    // Mostrar información de contacto
    showContactInfo() {
        const company = AppConfig.company;
        
        const content = `📞 **Información de Contacto - ${company.name}**\n\n` +
                       `📱 **Teléfono:** ${company.phone}\n` +
                       `💬 **WhatsApp:** ${company.whatsapp}\n` +
                       `📧 **Email:** ${company.email}\n` +
                       `📍 **Ubicación:** ${company.address}\n\n` +
                       `💬 **¡Contáctanos para más información!**\n\n` +
                       `*Escribe 0 para volver al menú principal*`;
        
        return {
            action: { type: 'CONTACT_INFO' },
            content
        };
    }

    // Mostrar ayuda de navegación
    showHelpNavigation() {
        const content = `🎯 **Cómo Navegar por el Sistema**\n\n` +
                       `**1. Selección por Números:**\n` +
                       `• Cada opción del menú tiene un número\n` +
                       `• Solo escribe el número (ej: "1", "2", "3")\n\n` +
                       `**2. Comandos de Texto:**\n` +
                       `• "volver" - Regresar al menú anterior\n` +
                       `• "ayuda" - Mostrar ayuda\n` +
                       `• "menu" - Ir al menú principal\n` +
                       `• "todas" - Ver todas las propiedades\n\n` +
                       `**3. Búsqueda Natural:**\n` +
                       `• Puedes escribir texto libre\n` +
                       `• El sistema entenderá tu consulta\n\n` +
                       `**Ejemplo:** "busco casa en Palermo con pileta"`;
        
        return {
            action: { type: 'HELP', topic: 'navigation' },
            content
        };
    }

    // Mostrar ayuda de búsqueda
    showHelpSearch() {
        const content = `🔍 **Búsqueda por Texto Libre**\n\n` +
                       `El sistema entiende lenguaje natural. Puedes escribir:\n\n` +
                       `**Por Ubicación:**\n` +
                       `• "departamentos en Palermo"\n` +
                       `• "casa en microcentro"\n` +
                       `• "oficinas en recoleta"\n\n` +
                       `**Por Precio:**\n` +
                       `• "hasta 200k USD"\n` +
                       `• "entre 100k y 300k"\n` +
                       `• "desde 50k"\n\n` +
                       `**Por Características:**\n` +
                       `• "3 ambientes"\n` +
                       `• "con pileta y cochera"\n` +
                       `• "monoambiente amoblado"\n\n` +
                       `**Combinaciones:**\n` +
                       `• "departamento 2 ambientes hasta 150k con aire acondicionado"`;
        
        return {
            action: { type: 'HELP', topic: 'search' },
            content
        };
    }

    // Mostrar ayuda del chatbot
    showHelpChatbot() {
        const content = `🤖 **Chatbot Inteligente**\n\n` +
                       `**Características Principales:**\n\n` +
                       `**1. Procesamiento de Lenguaje Natural:**\n` +
                       `• Entiende consultas en español\n` +
                       `• Detecta intenciones automáticamente\n` +
                       `• Filtra propiedades según tu descripción\n\n` +
                       `**2. Sistema de Menús:**\n` +
                       `• Navegación guiada por números\n` +
                       `• Acceso rápido a filtros comunes\n` +
                       `• Estadísticas del inventario\n\n` +
                       `**3. Búsqueda Avanzada:**\n` +
                       `• Filtros múltiples simultáneos\n` +
                       `• Búsqueda por amenidades\n` +
                       `• Rangos de precio personalizables\n\n` +
                       `**4. Integración WhatsApp:**\n` +
                       `• Contacto directo con propiedades\n` +
                       `• Información pre-cargada\n` +
                       `• Respuesta automática`;\        
        return {
            action: { type: 'HELP', topic: 'chatbot' },
            content
        };
    }

    // Ir al menú anterior
    goBack() {
        if (this.menuHistory.length > 0) {
            this.currentMenu = this.menuHistory.pop();
            return {
                action: { type: 'MOSTRAR_MENU', menu: this.currentMenu },
                content: this.formatMenu(this.menus[this.currentMenu])
            };
        } else {
            // Si no hay historial, ir al menú principal
            this.currentMenu = 'principal';
            return {
                action: { type: 'MOSTRAR_MENU', menu: 'principal' },
                content: this.formatMenu(this.menus['principal'])
            };
        }
    }

    // Resetear al menú principal
    reset() {
        this.currentMenu = 'principal';
        this.menuHistory = [];
        return this.showMenu('principal');
    }

    // Obtener menú actual
    getCurrentMenu() {
        return this.currentMenu;
    }

    // Obtener historial de menús
    getMenuHistory() {
        return [...this.menuHistory];
    }

    // Registrar callback para acciones
    onAction(callback) {
        this.callbacks.action = callback;
    }

    // Ejecutar callback de acción
    executeCallback(actionType, data) {
        if (this.callbacks.action) {
            try {
                this.callbacks.action(actionType, data);
            } catch (error) {
                ConfigUtils.error('Error ejecutando callback de acción:', error);
            }
        }
    }
}

// Crear instancia global
window.MenuSystem = new MenuSystem();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuSystem;
}