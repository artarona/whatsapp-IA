// ===== UTILIDADES GENERALES DEL SISTEMA =====

// Utilidades DOM
window.DOMUtils = {
    // Seleccionar elemento
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    // Seleccionar múltiples elementos
    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    // Crear elemento con atributos
    createElement(tag, attributes = {}, innerHTML = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (innerHTML) {
            element.innerHTML = innerHTML;
        }
        
        return element;
    },

    // Añadir clases
    addClass(element, classes) {
        if (!element) return;
        const classArray = Array.isArray(classes) ? classes : [classes];
        element.classList.add(...classArray);
    },

    // Remover clases
    removeClass(element, classes) {
        if (!element) return;
        const classArray = Array.isArray(classes) ? classes : [classes];
        element.classList.remove(...classArray);
    },

    // Alternar clase
    toggleClass(element, className) {
        if (!element) return;
        element.classList.toggle(className);
    },

    // Verificar si tiene clase
    hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    },

    // Ocultar elemento
    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    },

    // Mostrar elemento
    show(element, display = 'block') {
        if (element) {
            element.style.display = display;
        }
    },

    // Verificar si está visible
    isVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    },

    // Obtener posición de scroll
    getScrollPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    },

    // Scroll suave a elemento
    scrollToElement(element, offset = 0, duration = 500) {
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Función de easing
            const ease = progress < 0.5 
                ? 4 * progress * progress * progress 
                : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }
};

// Utilidades de String
window.StringUtils = {
    // Capitalizar primera letra
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Capitalizar cada palabra
    titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    // Limpiar string
    clean(str) {
        if (!str) return '';
        return str.trim().replace(/\s+/g, ' ');
    },

    // Truncar texto
    truncate(str, maxLength, suffix = '...') {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    },

    // Generar slug
    slug(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Extraer números de string
    extractNumbers(str) {
        if (!str) return [];
        const matches = str.match(/\d+/g);
        return matches ? matches.map(Number) : [];
    },

    // Reemplazar variables en template
    template(str, variables) {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] || match;
        });
    }
};

// Utilidades de Array
window.ArrayUtils = {
    // Remover duplicados
    unique(array) {
        return [...new Set(array)];
    },

    // Filtrar valores truthy
    compact(array) {
        return array.filter(Boolean);
    },

    // Agrupar por propiedad
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    // Ordenar por propiedad
    sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },

    // Agrupar en chunks
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    // Mezclar array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Buscar elemento
    findBy(array, key, value) {
        return array.find(item => item[key] === value);
    },

    // Filtrar por propiedad
    filterBy(array, key, value) {
        return array.filter(item => item[key] === value);
    }
};

// Utilidades de número
window.NumberUtils = {
    // Formatear número
    format(num, decimals = 0) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return Number(num).toLocaleString('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    // Formatear moneda
    formatCurrency(amount, currency = 'USD') {
        if (amount === null || amount === undefined || isNaN(amount)) return 'Consultar';
        if (amount === 0) return 'Consultar';
        
        const formatter = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(amount);
    },

    // Formatear porcentaje
    formatPercentage(num, decimals = 1) {
        if (num === null || num === undefined || isNaN(num)) return '0%';
        return `${(num * 100).toFixed(decimals)}%`;
    },

    // Generar número aleatorio
    random(min = 0, max = 100) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Clamp número
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    // Verificar si es número
    isNumber(value) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    }
};

// Utilidades de fecha
window.DateUtils = {
    // Formatear fecha
    format(date, format = 'dd/mm/yyyy') {
        if (!date) return '';
        
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return format
            .replace('dd', day)
            .replace('mm', month)
            .replace('yyyy', year);
    },

    // Formatear fecha relativa
    timeAgo(date) {
        if (!date) return '';
        
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'hace unos segundos';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
        
        return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
    },

    // Verificar si es fecha válida
    isValid(date) {
        return date instanceof Date && !isNaN(date);
    }
};

// Utilidades de validación
window.ValidationUtils = {
    // Validar email
    isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validar teléfono argentino
    isPhone(phone) {
        const regex = /^(\+54|54)?[\s-]?9?[\s-]?11[\s-]?\d{4}[\s-]?\d{4}$/;
        return regex.test(phone.replace(/\s/g, ''));
    },

    // Validar URL
    isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Validar objeto
    isObject(obj) {
        return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    },

    // Validar array
    isArray(arr) {
        return Array.isArray(arr);
    },

    // Validar string vacío
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    // Sanitizar string
    sanitize(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/[<>]/g, '') // Remover < y >
            .replace(/javascript:/gi, '') // Remover javascript:
            .trim();
    }
};

// Utilidades de localStorage
window.StorageUtils = {
    // Guardar en localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            ConfigUtils.error('Error guardando en localStorage:', error);
            return false;
        }
    },

    // Obtener de localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            ConfigUtils.error('Error obteniendo de localStorage:', error);
            return defaultValue;
        }
    },

    // Remover de localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            ConfigUtils.error('Error removiendo de localStorage:', error);
            return false;
        }
    },

    // Limpiar localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            ConfigUtils.error('Error limpiando localStorage:', error);
            return false;
        }
    },

    // Verificar si existe
    has(key) {
        return localStorage.getItem(key) !== null;
    }
};

// Utilidades de rendimiento
window.PerformanceUtils = {
    // Medir tiempo de ejecución
    measureTime(fn, label = 'Function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        ConfigUtils.debug(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    },

    // Medir tiempo asíncrono
    measureAsyncTime(fn, label = 'Async Function') {
        return PerformanceUtils.measureTime(async () => {
            return await fn();
        }, label);
    },

    // Debounce
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Utilidades de animación
window.AnimationUtils = {
    // Fade in
    fadeIn(element, duration = 300, callback = null) {
        if (!element) return;
        
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Fade out
    fadeOut(element, duration = 300, callback = null) {
        if (!element) return;
        
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.max(1 - (progress / duration), 0);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                if (callback) callback();
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Slide down
    slideDown(element, duration = 300) {
        if (!element) return;
        
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const height = element.scrollHeight;
        
        element.style.height = height + 'px';
        
        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
        }, duration);
    },

    // Slide up
    slideUp(element, duration = 300, callback = null) {
        if (!element) return;
        
        const height = element.scrollHeight;
        element.style.height = height + 'px';
        element.style.overflow = 'hidden';
        
        setTimeout(() => {
            element.style.height = '0px';
        }, 10);
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            if (callback) callback();
        }, duration);
    }
};

// Utilidades de eventos
window.EventUtils = {
    // Detectar click fuera del elemento
    onClickOutside(element, callback) {
        const handleClick = (event) => {
            if (element && !element.contains(event.target)) {
                callback();
            }
        };
        
        document.addEventListener('click', handleClick);
        
        return () => {
            document.removeEventListener('click', handleClick);
        };
    },

    // Detectar tecla presionada
    onKeyPress(element, key, callback) {
        const handleKeyPress = (event) => {
            if (event.key === key) {
                callback(event);
            }
        };
        
        element.addEventListener('keypress', handleKeyPress);
        
        return () => {
            element.removeEventListener('keypress', handleKeyPress);
        };
    },

    // Event delegation
    delegate(parent, selector, event, callback) {
        const handleEvent = (event) => {
            const target = event.target.closest(selector);
            if (parent.contains(target)) {
                callback(event, target);
            }
        };
        
        parent.addEventListener(event, handleEvent);
        
        return () => {
            parent.removeEventListener(event, handleEvent);
        };
    }
};

// Exportar utilidades
window.Utils = {
    DOM: DOMUtils,
    String: StringUtils,
    Array: ArrayUtils,
    Number: NumberUtils,
    Date: DateUtils,
    Validation: ValidationUtils,
    Storage: StorageUtils,
    Performance: PerformanceUtils,
    Animation: AnimationUtils,
    Event: EventUtils,
    
    // Utilidad general
    randomId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Retry function
    async retry(fn, attempts = 3, delay = 1000) {
        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === attempts - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },
    
    // Download file
    downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Log de inicialización
ConfigUtils.info('Utilidades cargadas correctamente');