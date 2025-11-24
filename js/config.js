// ===== CONFIGURACIÓN GLOBAL DEL SISTEMA =====

// Configuración principal
window.AppConfig = {
    // Información de la empresa
    company: {
        name: "Dante Propiedades",
        phone: "+54 11 2536-8595",
        whatsapp: "5491125368595",
        email: "info@dantepropiedades.com",
        address: "Buenos Aires, Argentina"
    },

    // URLs y endpoints
    api: {
        properties: "propiedades.json",
        images: "imgs/",
        assets: "assets/"
    },

    // Configuración de búsqueda
    search: {
        maxResults: 50,
        resultsPerPage: 12,
        priceRanges: [
            { min: 0, max: 100000, label: "Hasta $100,000 USD" },
            { min: 100000, max: 300000, label: "$100,000 - $300,000 USD" },
            { min: 300000, max: 500000, label: "$300,000 - $500,000 USD" },
            { min: 500000, max: Infinity, label: "Más de $500,000 USD" }
        ],
        defaultFilters: {
            precio_min: null,
            precio_max: null,
            ambientes_min: null,
            barrios: [],
            tipos: [],
            operaciones: []
        }
    },

    // Configuración del chatbot
    chatbot: {
        typingDelay: 800,
        messageDelay: 300,
        maxMessageLength: 300,
        welcomeMessages: [
            "🏠 ¡Hola! Soy tu asistente virtual de Dante Propiedades.",
            "",
            "🔍 **Te ayudo a encontrar la propiedad ideal:**",
            "• 🏙️ Por ubicación: \"departamentos en Palermo\"",
            "• 💰 Por precio: \"hasta 150k USD\"",
            "• 🏢 Por tipo: \"monoambientes en microcentro\"",
            "• 🛏️ Por ambientes: \"3 ambientes\"",
            "• ✨ Por amenidades: \"pileta y cochera\"",
            "• 🌆 Por barrio: \"casa en Parque Avellaneda\"",
            "",
            "💬 **Ejemplos:**",
            "\"Busco departamento de 2 ambientes hasta 200k USD en Palermo\"",
            "\"Monoambientes con pileta y cochera\"",
            "\"Casa en Parque Avellaneda con jardín\"",
            "",
            "¿En qué te ayudo hoy? 😊"
        ],
        quickCommands: [
            { text: "departamentos en Palermo", label: "Departamentos Palermo" },
            { text: "monoambientes microcentro hasta 100k", label: "Monoambientes centro" },
            { text: "casas con pileta", label: "Casas con pileta" },
            { text: "departamentos alquiler", label: "Departamentos alquiler" },
            { text: "propiedades hasta 150k USD", label: "Hasta 150k USD" }
        ]
    },

    // Configuración de propiedades
    properties: {
        imageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        defaultImage: "imgs/imagen-propiedad.svg",
        maxImagesPerProperty: 21,
        amenities: {
            pileta: { icon: "🏊", label: "Pileta", color: "#17a2b8" },
            cochera: { icon: "🚗", label: "Cochera", color: "#6c757d" },
            balcon: { icon: "🏞️", label: "Balcón", color: "#28a745" },
            aire_acondicionado: { icon: "❄️", label: "Aire Acondicionado", color: "#007bff" },
            acepta_mascotas: { icon: "🐕", label: "Mascotas", color: "#fd7e14" }
        }
    },

    // Configuración de filtros
    filters: {
        barrios: [],
        tipos: [],
        operaciones: ["venta", "alquiler"],
        minAmbientes: 0,
        maxAmbientes: 20
    },

    // Configuración de interfaz
    ui: {
        animations: {
            enabled: true,
            duration: 300,
            easing: "ease-in-out"
        },
        responsive: {
            mobileBreakpoint: 768,
            tabletBreakpoint: 992,
            desktopBreakpoint: 1200
        },
        loading: {
            showSpinner: true,
            showText: true,
            timeout: 10000
        }
    },

    // Configuración de WhatsApp
    whatsapp: {
        enabled: true,
        defaultMessage: "Hola, me interesa obtener más información sobre sus propiedades.",
        phone: "5491125368595"
    },

    // Configuración de menús
    menu: {
        enabled: true,
        autoShow: false,
        timeout: 5000
    },

    // Configuración de errores
    errorHandling: {
        showDetailedErrors: false,
        logToConsole: true,
        showUserFriendlyMessages: true,
        retryAttempts: 3,
        retryDelay: 1000
    },

    // Configuración de debug
    debug: {
        enabled: true,
        logLevel: "info", // "error", "warn", "info", "debug"
        showPerformanceMetrics: true,
        showMemoryUsage: false
    }
};

// Configuración por entorno
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Desarrollo
    AppConfig.debug.enabled = true;
    AppConfig.debug.logLevel = "debug";
} else {
    // Producción
    AppConfig.debug.enabled = false;
    AppConfig.debug.logLevel = "error";
}

// Funciones de utilidad para la configuración
window.ConfigUtils = {
    // Obtener configuración completa
    getConfig() {
        return AppConfig;
    },

    // Obtener valor de configuración por ruta
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let current = AppConfig;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    },

    // Obtener configuración de empresa
    getCompanyInfo() {
        return AppConfig.company;
    },

    // Obtener configuración de WhatsApp
    getWhatsAppConfig() {
        return AppConfig.whatsapp;
    },

    // Verificar si el debug está habilitado
    isDebugEnabled() {
        return AppConfig.debug.enabled;
    },

    // Log con nivel
    log(level, message, ...args) {
        if (!AppConfig.debug.enabled) return;

        const levels = {
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };

        const logFunction = levels[level] || console.log;
        const timestamp = new Date().toISOString();
        
        if (AppConfig.debug.showPerformanceMetrics) {
            const perfData = performance.now();
            message = `[${timestamp}] [${perfData.toFixed(2)}ms] ${message}`;
        }

        logFunction(message, ...args);
    },

    // Log de información
    info(message, ...args) {
        this.log('info', message, ...args);
    },

    // Log de advertencia
    warn(message, ...args) {
        this.log('warn', message, ...args);
    },

    // Log de error
    error(message, ...args) {
        this.log('error', message, ...args);
    },

    // Log de debug
    debug(message, ...args) {
        this.log('debug', message, ...args);
    },

    // Crear URL de WhatsApp
    createWhatsAppUrl(message, phone = null) {
        const config = AppConfig.whatsapp;
        const phoneNumber = phone || config.phone;
        const fullMessage = message || config.defaultMessage;
        const encodedMessage = encodeURIComponent(fullMessage);
        
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    },

    // Formatear precio
    formatPrice(price, currency = 'USD') {
        if (!price || price === 0) return 'Consultar';
        
        const formatter = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(price);
    },

    // Validar configuración
    validateConfig() {
        const errors = [];
        
        // Verificar configuraciones críticas
        if (!AppConfig.company.name) {
            errors.push('Company name is required');
        }
        
        if (!AppConfig.company.phone) {
            errors.push('Company phone is required');
        }
        
        if (!AppConfig.api.properties) {
            errors.push('Properties API endpoint is required');
        }
        
        if (!AppConfig.chatbot.welcomeMessages || AppConfig.chatbot.welcomeMessages.length === 0) {
            errors.push('Chatbot welcome messages are required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Validar configuración al cargar
document.addEventListener('DOMContentLoaded', () => {
    const validation = ConfigUtils.validateConfig();
    
    if (!validation.isValid) {
        ConfigUtils.error('Configuración inválida:', validation.errors);
    } else {
        ConfigUtils.info('Configuración validada correctamente');
    }
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppConfig, ConfigUtils };
}