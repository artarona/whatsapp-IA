// ===== CHATBOT INTELIGENTE =====

class Chatbot {
    constructor() {
        this.isTyping = false;
        this.chatHistory = [];
        this.currentMode = 'chat'; // 'chat' o 'menu'
        this.lastMessageTime = null;
        this.messageCount = 0;
        this.isInitialized = false;
        
        this.init();
    }

    // Inicializar el chatbot
    async init() {
        ConfigUtils.info('Inicializando chatbot...');
        
        try {
            await this.waitForPropertyManager();
            this.setupEventListeners();
            this.loadWelcomeMessage();
            this.loadQuickCommands();
            this.setupKeyboardListeners();
            
            this.isInitialized = true;
            ConfigUtils.info('Chatbot inicializado correctamente');
        } catch (error) {
            ConfigUtils.error('Error inicializando chatbot:', error);
        }
    }

    // Esperar a que PropertyManager esté listo
    async waitForPropertyManager() {
        let attempts = 0;
        while (!window.PropertyManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.PropertyManager) {
            throw new Error('PropertyManager no disponible');
        }
        
        // Esperar a que cargue las propiedades
        while (PropertyManager.getLoadingState()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        const sendButton = Utils.DOM.$('#sendButton');
        const messageInput = Utils.DOM.$('#messageInput');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', () => this.handleInputChange());
        }
        
        // Escuchar eventos de propiedades cargadas
        window.addEventListener('propertiesLoaded', (event) => {
            this.onPropertiesLoaded(event.detail);
        });
    }

    // Configurar listeners de teclado
    setupKeyboardListeners() {
        const messageInput = Utils.DOM.$('#messageInput');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    // Cargar mensaje de bienvenida
    loadWelcomeMessage() {
        const welcomeContainer = Utils.DOM.$('#welcomeMessage');
        const chatbot = AppConfig.chatbot;
        
        if (welcomeContainer && chatbot.welcomeMessages) {
            const message = chatbot.welcomeMessages.join('\n');
            this.displayMessage(message, 'bot');
        }
    }

    // Cargar comandos rápidos
    loadQuickCommands() {
        const quickCommandsContainer = Utils.DOM.$('#quickCommands');
        const chatbot = AppConfig.chatbot;
        
        if (quickCommandsContainer && chatbot.quickCommands) {
            quickCommandsContainer.innerHTML = '';
            
            chatbot.quickCommands.forEach(command => {
                const button = Utils.DOM.createElement('button', {
                    className: 'command-btn',
                    onclick: () => this.executeQuickCommand(command.text)
                }, command.label);
                
                quickCommandsContainer.appendChild(button);
            });
        }
    }

    // Ejecutar comando rápido
    executeQuickCommand(commandText) {
        const messageInput = Utils.DOM.$('#messageInput');
        if (messageInput) {
            messageInput.value = commandText;
            this.sendMessage();
        }
    }

    // Enviar mensaje
    async sendMessage() {
        const messageInput = Utils.DOM.$('#messageInput');
        const message = messageInput ? messageInput.value.trim() : '';
        
        if (!message || this.isTyping) {
            return;
        }
        
        // Limpiar input
        if (messageInput) {
            messageInput.value = '';
        }
        
        // Agregar mensaje del usuario
        this.displayMessage(message, 'user');
        
        // Mostrar indicador de escritura
        this.showTyping();
        
        try {
            // Procesar mensaje con delay
            await this.delay(AppConfig.chatbot.typingDelay);
            
            this.hideTyping();
            
            // Determinar modo de procesamiento
            const response = await this.processMessage(message);
            
            // Mostrar respuesta
            this.displayMessage(response.content, 'bot');
            
            // Ejecutar acción si existe
            if (response.action) {
                this.executeAction(response.action);
            }
            
        } catch (error) {
            ConfigUtils.error('Error procesando mensaje:', error);
            this.hideTyping();
            this.displayMessage('❌ Lo siento, ocurrió un error procesando tu mensaje. Por favor, intenta nuevamente.', 'bot');
        }
    }

    // Procesar mensaje del usuario
    async processMessage(message) {
        this.messageCount++;
        this.lastMessageTime = new Date();
        
        // Si está en modo menú, usar sistema de menús
        if (this.currentMode === 'menu') {
            return window.MenuSystem.processResponse(message);
        }
        
        // Detectar si es un comando especial
        const specialCommands = this.detectSpecialCommands(message);
        if (specialCommands) {
            return specialCommands;
        }
        
        // Procesar como búsqueda por texto libre
        return this.processNaturalLanguageSearch(message);
    }

    // Detectar comandos especiales
    detectSpecialCommands(message) {
        const lowerMessage = message.toLowerCase();
        
        // Comandos de navegación
        if (['menu', 'menú', 'opciones'].includes(lowerMessage)) {
            return {
                action: { type: 'MOSTRAR_MENU', menu: 'principal' },
                content: window.MenuSystem.showMenu('principal')
            };
        }
        
        if (['volver', 'atrás'].includes(lowerMessage)) {
            return {
                action: { type: 'VOLVER' },
                content: 'Regresando al menú anterior...'
            };
        }
        
        // Comandos de información
        if (['estadísticas', 'stats', 'inventario'].includes(lowerMessage)) {
            return {
                action: { type: 'ESTADISTICAS' },
                content: 'Mostrando estadísticas del inventario...'
            };
        }
        
        if (['contacto', 'contactar', 'teléfono'].includes(lowerMessage)) {
            const company = AppConfig.company;
            return {
                action: { type: 'CONTACT_INFO' },
                content: `📞 **Contacto - ${company.name}**\n\n📱 Teléfono: ${company.phone}\n💬 WhatsApp: ${company.whatsapp}\n📧 Email: ${company.email}`
            };
        }
        
        // Comandos de ayuda
        if (['ayuda', 'help', 'como usar'].includes(lowerMessage)) {
            return {
                action: { type: 'MOSTRAR_MENU', menu: 'ayuda' },
                content: window.MenuSystem.showMenu('ayuda')
            };
        }
        
        // Detectar números para navegación de menús
        if (Utils.Number.isNumber(message)) {
            return window.MenuSystem.processResponse(message);
        }
        
        return null;
    }

    // Procesar búsqueda por lenguaje natural
    async processNaturalLanguageSearch(query) {
        ConfigUtils.debug('Procesando búsqueda:', query);
        
        try {
            // Extraer filtros de la consulta
            const filters = PropertyManager.processNaturalLanguageQuery(query);
            
            // Buscar propiedades
            const results = PropertyManager.searchProperties(filters);
            
            // Generar respuesta
            const response = this.generateSearchResponse(results, query, filters);
            
            return {
                action: { 
                    type: 'SEARCH_RESULTS', 
                    results: results,
                    filters: filters 
                },
                content: response
            };
            
        } catch (error) {
            ConfigUtils.error('Error en búsqueda por lenguaje natural:', error);
            return {
                content: '❌ Error procesando la búsqueda. Por favor, intenta con una consulta diferente.'
            };
        }
    }

    // Generar respuesta de búsqueda
    generateSearchResponse(results, query, filters) {
        if (results.length === 0) {
            return this.generateNoResultsResponse(query, filters);
        }
        
        let response = `🔍 **Encontré ${results.length} propiedades**\n\n`;
        
        if (results.length <= 3) {
            // Mostrar detalles completos para pocas propiedades
            results.forEach((property, index) => {
                response += `**${index + 1}. ${property.titulo}**\n`;
                response += `📍 ${property.barrio}\n`;
                response += `💰 ${Utils.Number.formatCurrency(property.precio, property.moneda_precio)}\n`;
                response += `🛏️ ${property.ambientes} amb | 📐 ${property.metros_cuadrados} m²\n`;
                
                if (property.descripcion) {
                    response += `📝 ${Utils.String.truncate(property.descripcion, 100)}\n`;
                }
                
                response += '\n';
            });
            
            if (results.length === 1) {
                response += `✨ **¿Te interesa esta propiedad?**\n`;
                response += `Responde "más detalles" para información completa\n\n`;
            } else {
                response += `💬 **¿Cuál te interesa más?**\n`;
                response += `Responde con el número (1, 2, 3...) para ver detalles\n\n`;
            }
            
        } else {
            // Mostrar resumen para muchas propiedades
            results.slice(0, 3).forEach((property, index) => {
                response += `${index + 1}. ${property.titulo}\n`;
                response += `   💰 ${Utils.Number.formatCurrency(property.precio, property.moneda_precio)}\n`;
                response += `   📍 ${property.barrio}\n\n`;
            });
            
            response += `📝 **Y ${results.length - 3} propiedades más...**\n\n`;
            response += `💬 **Para ver todos los detalles:**\n`;
            response += `• "Ver todas las propiedades"\n`;
            response += `• "Mostrar por tipo: casa/departamento"\n`;
            response += `• "Filtros avanzados"\n\n`;
        }
        
        // Añadir información de contacto
        response += `🏢 **${AppConfig.company.name}**\n📞 ${AppConfig.company.phone}`;
        
        return response;
    }

    // Generar respuesta cuando no hay resultados
    generateNoResultsResponse(query, filters) {
        let response = `😅 **No encontré propiedades** con esos criterios.\n\n`;
        response += `📋 **Tu búsqueda:** "${query}"\n\n`;
        response += `💡 **Sugerencias:**\n`;
        response += `• Amplía el rango de precios\n`;
        response += `• Busca en otros barrios\n`;
        response += `• Consulta propiedades con menos amenidades\n`;
        response += `• Ver todas las propiedades disponibles\n\n`;
        response += `¿Te gustaría intentar otra búsqueda? 😊`;
        
        return response;
    }

    // Ejecutar acción
    executeAction(action) {
        ConfigUtils.debug('Ejecutando acción:', action);
        
        switch (action.type) {
            case 'MOSTRAR_MENU':
                this.currentMode = 'menu';
                // El contenido ya se muestra en el mensaje
                break;
                
            case 'MOSTRAR_TODAS':
                this.showAllProperties();
                break;
                
            case 'FILTRAR':
                this.applyFilter(action.filterType, action.value);
                break;
                
            case 'SEARCH_RESULTS':
                this.displaySearchResults(action.results);
                break;
                
            case 'ESTADISTICAS':
                this.showStatistics();
                break;
                
            case 'CONTACT_INFO':
                this.showContactInfo();
                break;
                
            case 'VOLVER':
                this.goBack();
                break;
                
            case 'HELP':
                this.showHelp(action.topic);
                break;
                
            default:
                ConfigUtils.warn(`Acción no reconocida: ${action.type}`);
        }
    }

    // Mostrar todas las propiedades
    showAllProperties() {
        const properties = PropertyManager.getAllProperties();
        this.displaySearchResults(properties);
        
        this.displayMessage(
            `📋 Mostrando todas las propiedades disponibles (${properties.length} propiedades)`,
            'bot'
        );
    }

    // Aplicar filtro
    applyFilter(filterType, value) {
        let filters = {};
        
        switch (filterType) {
            case 'tipo':
                filters.tipos = [value];
                break;
            case 'barrio':
                filters.barrios = [value];
                break;
            case 'precio':
                filters.precio_min = value.min;
                filters.precio_max = value.max === Infinity ? null : value.max;
                break;
        }
        
        const results = PropertyManager.searchProperties(filters);
        this.displaySearchResults(results);
        
        let filterDescription = '';
        switch (filterType) {
            case 'tipo':
                filterDescription = `tipo "${value}"`;
                break;
            case 'barrio':
                filterDescription = `barrio "${value}"`;
                break;
            case 'precio':
                filterDescription = `precio ${value.label}`;
                break;
        }
        
        this.displayMessage(
            `🔍 Mostrando propiedades filtradas por ${filterDescription} (${results.length} encontradas)`,
            'bot'
        );
    }

    // Mostrar resultados de búsqueda
    displaySearchResults(properties) {
        const event = new CustomEvent('displaySearchResults', {
            detail: { properties }
        });
        window.dispatchEvent(event);
    }

    // Mostrar estadísticas
    showStatistics() {
        const stats = PropertyManager.getInventoryStats();
        
        let message = `📊 **Estadísticas del Inventario**\n\n`;
        message += `• **Total:** ${stats.total} propiedades\n`;
        message += `• **Tipos:** ${Object.keys(stats.porTipo).length}\n`;
        message += `• **Barrios:** ${Object.keys(stats.porBarrio).length}\n`;
        message += `• **Precio Promedio:** ${Utils.Number.formatCurrency(stats.precioPromedio)}\n`;
        
        this.displayMessage(message, 'bot');
    }

    // Mostrar información de contacto
    showContactInfo() {
        const company = AppConfig.company;
        
        let message = `📞 **Contacto - ${company.name}**\n\n`;
        message += `📱 **Teléfono:** ${company.phone}\n`;
        message += `💬 **WhatsApp:** ${company.whatsapp}\n`;
        message += `📧 **Email:** ${company.email}\n`;
        message += `📍 **Ubicación:** ${company.address}\n\n`;
        message += `¡Contáctanos para más información!`;
        
        this.displayMessage(message, 'bot');
    }

    // Regresar al menú anterior
    goBack() {
        const response = window.MenuSystem.goBack();
        this.displayMessage(response.content, 'bot');
        
        if (response.action && response.action.type === 'MOSTRAR_MENU') {
            this.currentMode = 'menu';
        }
    }

    // Mostrar ayuda
    showHelp(topic) {
        // La ayuda ya se muestra en el sistema de menús
    }

    // Mostrar indicador de escritura
    showTyping() {
        this.isTyping = true;
        
        const chatMessages = Utils.DOM.$('#chatMessages');
        if (!chatMessages) return;
        
        const typingDiv = Utils.DOM.createElement('div', {
            className: 'message bot-message typing-message',
            id: 'typingIndicator'
        }, `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>Escribiendo...</span>
        `);
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Ocultar indicador de escritura
    hideTyping() {
        this.isTyping = false;
        
        const typingIndicator = Utils.DOM.$('#typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Mostrar mensaje en el chat
    displayMessage(content, sender = 'bot') {
        const chatMessages = Utils.DOM.$('#chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = Utils.DOM.createElement('div', {
            className: `message ${sender}-message fade-in`
        });
        
        // Procesar contenido con formato
        messageDiv.innerHTML = this.formatMessageContent(content);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Agregar al historial
        this.chatHistory.push({
            content,
            sender,
            timestamp: new Date()
        });
    }

    // Formatear contenido del mensaje
    formatMessageContent(content) {
        // Convertir markdown básico a HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '• ');
    }

    // Manejar cambio en el input
    handleInputChange() {
        const messageInput = Utils.DOM.$('#messageInput');
        const sendButton = Utils.DOM.$('#sendButton');
        
        if (messageInput && sendButton) {
            const hasText = messageInput.value.trim().length > 0;
            sendButton.disabled = !hasText || this.isTyping;
            
            // Ajustar altura del input
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        }
    }

    // Manejar cuando se cargan las propiedades
    onPropertiesLoaded(data) {
        ConfigUtils.info('Propiedades cargadas, actualizando chatbot...');
        
        // Actualizar comandos rápidos dinámicamente
        this.updateQuickCommands(data.properties);
    }

    // Actualizar comandos rápidos
    updateQuickCommands(properties) {
        // Generar comandos basados en las propiedades actuales
        const barriosPopulares = this.getPopularNeighborhoods(properties);
        const tiposDisponibles = this.getAvailableTypes(properties);
        
        // Actualizar con comandos más relevantes
        const dynamicCommands = [
            { text: `departamentos en ${barriosPopulares[0]}`, label: `Deptos ${barriosPopulares[0]}` },
            { text: `${tiposDisponibles[0]} hasta 150k`, label: `${Utils.String.titleCase(tiposDisponibles[0])}` },
            { text: 'casas con pileta', label: 'Casas Pileta' },
            { text: 'alquiler', label: 'Alquileres' },
            { text: 'hasta 100k USD', label: 'Hasta 100k' }
        ].slice(0, 5);
        
        const quickCommandsContainer = Utils.DOM.$('#quickCommands');
        if (quickCommandsContainer) {
            quickCommandsContainer.innerHTML = '';
            dynamicCommands.forEach(command => {
                const button = Utils.DOM.createElement('button', {
                    className: 'command-btn',
                    onclick: () => this.executeQuickCommand(command.text)
                }, command.label);
                quickCommandsContainer.appendChild(button);
            });
        }
    }

    // Obtener barrios populares
    getPopularNeighborhoods(properties) {
        const neighborhoodCounts = {};
        properties.forEach(property => {
            neighborhoodCounts[property.barrio] = (neighborhoodCounts[property.barrio] || 0) + 1;
        });
        
        return Object.entries(neighborhoodCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([barrio]) => barrio);
    }

    // Obtener tipos disponibles
    getAvailableTypes(properties) {
        const types = [...new Set(properties.map(p => p.tipo))];
        return types.slice(0, 3);
    }

    // Utility delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Limpiar chat
    clearChat() {
        const chatMessages = Utils.DOM.$('#chatMessages');
        if (chatMessages) {
            // Mantener solo el mensaje de bienvenida
            const welcomeMessage = Utils.DOM.$('#welcomeMessage');
            chatMessages.innerHTML = '';
            if (welcomeMessage) {
                chatMessages.appendChild(welcomeMessage);
            }
        }
        
        this.chatHistory = [];
        this.messageCount = 0;
    }

    // Obtener historial del chat
    getChatHistory() {
        return [...this.chatHistory];
    }

    // Obtener estado del chatbot
    getState() {
        return {
            isTyping: this.isTyping,
            currentMode: this.currentMode,
            messageCount: this.messageCount,
            isInitialized: this.isInitialized
        };
    }

    // ===== NUEVAS FUNCIONES INTEGRADAS =====
    
    // Mostrar resultados de búsqueda mejorados
    displaySearchResults(properties, query = '') {
        if (properties.length === 0) {
            this.addBotMessage(
                `❌ No encontré propiedades que coincidan con tu búsqueda.

` +
                `💡 **Sugerencias:**
` +
                `• Intenta con términos más generales
` +
                `• Revisa los filtros de búsqueda avanzada
` +
                `• Contactános para propiedades personalizadas

` +
                `¿Te ayudo con otra búsqueda?`
            );
            return;
        }

        const resultMessage = `🎉 **Encontré ${properties.length} propiedad${properties.length > 1 ? 'es' : ''}**

`;
        
        if (query) {
            this.addBotMessage(`${resultMessage}Para tu búsqueda: "${query}"`);
        } else {
            this.addBotMessage(resultMessage);
        }

        // Mostrar tarjetas de propiedades
        setTimeout(() => {
            properties.slice(0, 6).forEach(property => {
                this.displayPropertyCard(property);
            });
            
            if (properties.length > 6) {
                this.addBotMessage(
                    `... y ${properties.length - 6} propiedades más.

` +
                    `🔍 Usa la búsqueda avanzada para ver más resultados.`
                );
            }
        }, 500);
    }

    // Mostrar tarjeta de propiedad en el chat
    displayPropertyCard(property) {
        const cardHTML = `
            <div class="chat-property-card">
                ${PropertyManager.createPropertyImageHTML(property)}
                <div class="property-content">
                    <h4>${property.titulo}</h4>
                    <div class="property-quick-info">
                        <span>📍 ${property.barrio}</span>
                        <span>💰 $${property.precio ? property.precio.toLocaleString() : 'Consultar'}</span>
                        <span>🛏️ ${property.ambientes || 'N/A'} amb.</span>
                        <span>📐 ${property.metros_cuadrados || 'N/A'} m²</span>
                    </div>
                    <div class="property-quick-actions">
                        <button class="btn-small btn-primary" onclick="showPropertyGallery('${property.id_temporal}')">
                            📸 Ver Fotos
                        </button>
                        <a href="${ConfigUtils.createWhatsAppUrl(`Hola, me interesa ${property.titulo}`)}" 
                           class="btn-small btn-secondary" target="_blank">
                            💬 Contactar
                        </a>
                        <button class="btn-small btn-secondary" onclick="saveToFavorites('${property.id_temporal}')">
                            ❤️ Favorito
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addBotMessage(cardHTML);
    }

    // Procesar respuesta del menú del sistema
    processMenuResponse(response) {
        const result = MenuSystem.processResponse(response);
        
        if (result.error) {
            this.addBotMessage(result.content);
            return;
        }

        // Mostrar respuesta del menú
        this.addBotMessage(result.content);
        
        // Ejecutar acción si existe
        if (result.action) {
            this.executeMenuAction(result.action);
        }
    }

    // Ejecutar acción del menú
    executeMenuAction(action) {
        switch (action.type) {
            case 'MOSTRAR_TODAS':
                const allProperties = PropertyManager.getAllProperties();
                this.displaySearchResults(allProperties, 'todas las propiedades');
                break;
                
            case 'FILTRAR':
                this.executeFilter(action);
                break;
                
            case 'BUSQUEDA_TEXTO':
                this.executeTextSearch(action.query);
                break;
                
            case 'STATISTICS':
                this.showStatistics(action.statsType);
                break;
                
            case 'CONTACT_INFO':
                this.showContactInfo();
                break;
        }
    }

    // Ejecutar filtro
    executeFilter(action) {
        const filters = {};
        
        switch (action.filterType) {
            case 'tipo':
                filters.tipos = [action.value];
                break;
            case 'barrio':
                filters.barrios = [action.value];
                break;
            case 'precio':
                filters.precio_min = action.value.min;
                filters.precio_max = action.value.max === Infinity ? null : action.value.max;
                break;
        }
        
        const results = PropertyManager.searchProperties(filters);
        this.displaySearchResults(results, `${action.filterType}: ${action.value}`);
    }

    // Ejecutar búsqueda por texto
    executeTextSearch(query) {
        const filters = PropertyManager.processNaturalLanguageQuery(query);
        const results = PropertyManager.searchProperties(filters);
        this.displaySearchResults(results, query);
    }

    // Mostrar estadísticas
    showStatistics(type) {
        const stats = PropertyManager.getInventoryStats();
        
        let message = `📊 **Estadísticas del Inventario**\n\n`;
        
        switch (type) {
            case 'total':
                message += `**Total de Propiedades:** ${stats.total}\n\n`;
                message += `**Operaciones:**\n`;
                Object.entries(stats.porOperacion).forEach(([op, count]) => {
                    message += `• ${Utils.String.titleCase(op)}: ${count}\n`;
                });
                break;
                
            case 'tipos':
                message += `**Por Tipo:**\n`;
                Object.entries(stats.porTipo)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([tipo, count]) => {
                        const percentage = ((count / stats.total) * 100).toFixed(1);
                        message += `• ${Utils.String.titleCase(tipo)}: ${count} (${percentage}%)\n`;
                    });
                break;
        }
        
        this.addBotMessage(message);
    }

    // Mostrar información de contacto
    showContactInfo() {
        const company = AppConfig.company;
        const message = `📞 **${company.name}**\n\n` +
                       `📱 **Teléfono:** ${company.phone}\n` +
                       `💬 **WhatsApp:** ${company.whatsapp}\n` +
                       `📧 **Email:** ${company.email}\n\n` +
                       `🤖 **¿En qué más puedo ayudarte?**`;
        
        this.addBotMessage(message);
    }
}

// Crear instancia global
window.Chatbot = new Chatbot();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chatbot;
}