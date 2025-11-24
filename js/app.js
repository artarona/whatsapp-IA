// ===== APLICACIÓN PRINCIPAL =====

class App {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.eventListeners = [];
        
        this.init();
    }

    // Inicializar la aplicación
    async init() {
        ConfigUtils.info('Inicializando aplicación...');
        
        try {
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Inicializar componentes en orden
            await this.initializeComponents();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Configurar interfaz
            this.setupUI();
            
            this.isInitialized = true;
            ConfigUtils.info('Aplicación inicializada correctamente');
            
            // Mostrar estado inicial
            this.showInitialState();
            
        } catch (error) {
            ConfigUtils.error('Error inicializando aplicación:', error);
            this.showErrorState(error);
        }
    }

    // Inicializar componentes
    async initializeComponents() {
        ConfigUtils.info('Inicializando componentes...');
        
        const initSteps = [
            { name: 'PropertyManager', component: () => this.waitForComponent('PropertyManager') },
            { name: 'Chatbot', component: () => this.waitForComponent('Chatbot') },
            { name: 'MenuSystem', component: () => this.waitForComponent('MenuSystem') },
            { name: 'UI', component: () => this.setupAdvancedUI() }
        ];
        
        for (const step of initSteps) {
            try {
                ConfigUtils.debug(`Inicializando ${step.name}...`);
                await step.component();
                this.components[step.name] = true;
                ConfigUtils.info(`${step.name} inicializado`);
            } catch (error) {
                ConfigUtils.error(`Error inicializando ${step.name}:`, error);
                throw error;
            }
        }
    }

    // Esperar a que un componente esté disponible
    async waitForComponent(componentName) {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!window[componentName] && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window[componentName]) {
            throw new Error(`Componente ${componentName} no disponible después de ${maxAttempts} intentos`);
        }
        
        // Para PropertyManager, esperar a que termine de cargar
        if (componentName === 'PropertyManager') {
            while (window.PropertyManager.getLoadingState()) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    // Configurar eventos globales
    setupGlobalEvents() {
        ConfigUtils.debug('Configurando eventos globales...');
        
        // Evento de resultados de búsqueda
        window.addEventListener('displaySearchResults', (event) => {
            this.displaySearchResults(event.detail.properties);
        });
        
        // Evento de propiedades cargadas
        window.addEventListener('propertiesLoaded', (event) => {
            this.onPropertiesLoaded(event.detail);
        });
        
        // Evento de redimensionamiento
        window.addEventListener('resize', Utils.Performance.throttle(() => {
            this.handleResize();
        }, 250));
        
        // Evento de scroll
        window.addEventListener('scroll', Utils.Performance.throttle(() => {
            this.handleScroll();
        }, 100));
        
        // Manejo de errores globales
        window.addEventListener('error', (event) => {
            ConfigUtils.error('Error global:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            ConfigUtils.error('Promesa rechazada:', event.reason);
            this.handleUnhandledRejection(event.reason);
        });
    }

    // Configurar interfaz avanzada
    setupAdvancedUI() {
        // Configurar tooltips
        this.setupTooltips();
        
        // Configurar lazy loading de imágenes
        this.setupLazyLoading();
        
        // Configurar animaciones de scroll
        this.setupScrollAnimations();
        
        // Configurar filtros avanzados
        this.setupAdvancedFilters();
        
        // Configurar modal de fotos
        this.setupPhotoModal();
        
        // Configurar botones de acción
        this.setupActionButtons();
    }

    // Configurar tooltips
    setupTooltips() {
        const tooltipElements = Utils.DOM.$$('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    // Mostrar tooltip
    showTooltip(element, text) {
        const tooltip = Utils.DOM.createElement('div', {
            className: 'tooltip',
            id: 'tooltip'
        }, text);
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = (rect.left + (rect.width / 2) - (tooltipRect.width / 2)) + 'px';
        tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
        
        // Animación
        Utils.Animation.fadeIn(tooltip, 200);
    }

    // Ocultar tooltip
    hideTooltip() {
        const tooltip = Utils.DOM.$('#tooltip');
        if (tooltip) {
            Utils.Animation.fadeOut(tooltip, 200, () => {
                tooltip.remove();
            });
        }
    }

    // Configurar lazy loading
    setupLazyLoading() {
        const images = Utils.DOM.$$('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Configurar animaciones de scroll
    setupScrollAnimations() {
        const animatedElements = Utils.DOM.$$('[data-animate]');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.dataset.animate;
                    element.classList.add(`animate-${animationType}`);
                    animationObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => animationObserver.observe(element));
    }

    // Configurar filtros avanzados
    setupAdvancedFilters() {
        const searchBtn = Utils.DOM.$('#searchBtn');
        const resetBtn = Utils.DOM.$('#resetBtn');
        const showAllBtn = Utils.DOM.$('#showAllBtn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performAdvancedSearch());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.showAllProperties());
        }
        
        // Event listeners para filtros
        this.setupFilterEventListeners();
    }

    // Configurar event listeners de filtros
    setupFilterEventListeners() {
        const filterElements = [
            '#barrio-select',
            '#tipo-select', 
            '#operacion-select',
            '#precio-min',
            '#precio-max',
            '#ambientes-min'
        ];
        
        filterElements.forEach(selector => {
            const element = Utils.DOM.$(selector);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFilterVisualFeedback();
                });
                
                if (element.type === 'number') {
                    element.addEventListener('input', () => {
                        this.updateFilterVisualFeedback();
                    });
                }
            }
        });
    }

    // Actualizar feedback visual de filtros
    updateFilterVisualFeedback() {
        const filterElements = [
            '#barrio-select',
            '#tipo-select',
            '#operacion-select',
            '#precio-min',
            '#precio-max',
            '#ambientes-min'
        ];
        
        filterElements.forEach(selector => {
            const element = Utils.DOM.$(selector);
            if (element) {
                const hasValue = element.value && element.value.trim() !== '';
                
                if (hasValue) {
                    Utils.DOM.addClass(element, 'filter-active');
                } else {
                    Utils.DOM.removeClass(element, 'filter-active');
                }
            }
        });
    }

    // Configurar modal de fotos
    setupPhotoModal() {
        // Los event listeners se configuran dinámicamente cuando se muestran las propiedades
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('property-image') || 
                event.target.closest('.property-image')) {
                
                const propertyCard = event.target.closest('.property-card');
                if (propertyCard) {
                    const propertyId = propertyCard.dataset.propertyId;
                    if (propertyId) {
                        this.showPropertyPhotos(propertyId);
                    }
                }
            }
        });
    }

    // Configurar botones de acción
    setupActionButtons() {
        // Los botones se configuran dinámicamente en las tarjetas de propiedades
    }

    // Configurar interfaz básica
    setupUI() {
        // Configurar header fijo
        this.setupFixedHeader();
        
        // Configurar smooth scroll
        this.setupSmoothScroll();
        
        // Configurar botones de acción rápida
        this.setupQuickActions();
        
        // Configurar búsqueda instantánea
        this.setupInstantSearch();
    }

    // Configurar header fijo
    setupFixedHeader() {
        const header = Utils.DOM.$('.header');
        if (!header) return;
        
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', Utils.Performance.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        }, 100));
    }

    // Configurar smooth scroll
    setupSmoothScroll() {
        const links = Utils.DOM.$$('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const target = Utils.DOM.$('#' + targetId);
                
                if (target) {
                    Utils.DOM.scrollToElement(target, 100, 500);
                }
            });
        });
    }

    // Configurar acciones rápidas
    setupQuickActions() {
        const quickActions = [
            { selector: '#showFavoritesBtn', action: 'showFavorites' },
            { selector: '#compareBtn', action: 'compareProperties' },
            { selector: '#exportBtn', action: 'exportResults' },
            { selector: '#shareBtn', action: 'shareResults' }
        ];
        
        quickActions.forEach(({ selector, action }) => {
            const button = Utils.DOM.$(selector);
            if (button) {
                button.addEventListener('click', () => {
                    this.handleQuickAction(action);
                });
            }
        });
    }

    // Configurar búsqueda instantánea
    setupInstantSearch() {
        const searchInput = Utils.DOM.$('#instantSearchInput');
        if (!searchInput) return;
        
        const debouncedSearch = Utils.Performance.debounce((query) => {
            if (query.length >= 3) {
                this.performInstantSearch(query);
            } else if (query.length === 0) {
                this.clearInstantSearch();
            }
        }, 300);
        
        searchInput.addEventListener('input', (event) => {
            debouncedSearch(event.target.value.trim());
        });
    }

    // Mostrar estado inicial
    showInitialState() {
        // Las propiedades se cargan automáticamente
        this.updateSearchStats(0);
        
        // Mostrar mensaje de bienvenida en la sección de propiedades
        this.showNoResultsState();
    }

    // Mostrar estado de error
    showErrorState(error) {
        const resultsContainer = Utils.DOM.$('#propertyResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error cargando la aplicación</h3>
                    <p>${error.message || 'Ha ocurrido un error inesperado'}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        🔄 Recargar Página
                    </button>
                </div>
            `;
        }
    }

    // Manejar cuando se cargan las propiedades
    onPropertiesLoaded(data) {
        ConfigUtils.info('Propiedades cargadas, actualizando interfaz...');
        
        // Actualizar filtros dinámicamente
        this.updateDynamicFilters(data.filters);
        
        // Mostrar mensaje de bienvenida actualizado
        this.updateWelcomeMessage(data);
        
        // Configurar callbacks del sistema de menús
        this.setupMenuCallbacks();
    }

    // Actualizar filtros dinámicamente
    updateDynamicFilters(filters) {
        // Actualizar selector de barrios
        const barrioSelect = Utils.DOM.$('#barrio-select');
        if (barrioSelect && filters.barrios) {
            this.populateSelectOptions(barrioSelect, filters.barrios, 'Todos los barrios');
        }
        
        // Actualizar selector de tipos
        const tipoSelect = Utils.DOM.$('#tipo-select');
        if (tipoSelect && filters.tipos) {
            this.populateSelectOptions(tipoSelect, filters.tipos, 'Todos los tipos');
        }
    }

    // Poblar opciones de select
    populateSelectOptions(selectElement, options, defaultText) {
        // Limpiar opciones existentes excepto la primera
        while (selectElement.children.length > 1) {
            selectElement.removeChild(selectElement.lastChild);
        }
        
        // Agregar nuevas opciones
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    // Actualizar mensaje de bienvenida
    updateWelcomeMessage(data) {
        const total = data.properties.length;
        const tipos = data.filters.tipos.length;
        const barrios = data.filters.barrios.length;
        
        ConfigUtils.info(`Sistema listo: ${total} propiedades, ${tipos} tipos, ${barrios} barrios`);
    }

    // Configurar callbacks del sistema de menús
    setupMenuCallbacks() {
        if (window.MenuSystem) {
            window.MenuSystem.onAction((actionType, data) => {
                this.handleMenuAction(actionType, data);
            });
        }
    }

    // Manejar acciones del menú
    handleMenuAction(actionType, data) {
        switch (actionType) {
            case 'SEARCH_RESULTS':
                this.displaySearchResults(data.results);
                break;
            case 'STATISTICS':
                this.displayStatistics(data.statsType);
                break;
            case 'CONTACT_INFO':
                this.showContactModal();
                break;
        }
    }

    // Mostrar/actualizar resultados de búsqueda
    displaySearchResults(properties) {
        const resultsContainer = Utils.DOM.$('#propertyResults');
        const statsElement = Utils.DOM.$('#searchStats');
        const countElement = Utils.DOM.$('#resultsCount');
        
        if (properties.length === 0) {
            this.showNoResultsState();
            return;
        }
        
        // Actualizar estadísticas
        if (statsElement && countElement) {
            statsElement.style.display = 'block';
            countElement.textContent = properties.length;
        }
        
        // Generar HTML de resultados
        const html = this.generatePropertyCardsHTML(properties.slice(0, AppConfig.search.resultsPerPage));
        
        if (resultsContainer) {
            resultsContainer.innerHTML = html;
            
            // Animar entrada
            Utils.Animation.fadeIn(resultsContainer, 300);
        }
        
        // Scroll a resultados
        Utils.DOM.scrollToElement(resultsContainer, 50, 500);
        
        // Configurar eventos de las tarjetas
        this.setupPropertyCardEvents();
        
        // Mostrar botón de "ver más" si es necesario
        if (properties.length > AppConfig.search.resultsPerPage) {
            this.showLoadMoreButton(properties);
        }
    }

    // Generar HTML de tarjetas de propiedades
    generatePropertyCardsHTML(properties) {
        return properties.map(property => this.generatePropertyCardHTML(property)).join('');
    }

    // Generar HTML de una tarjeta de propiedad
    generatePropertyCardHTML(property) {
        const mainImage = PropertyManager.getPropertyMainImage(property);
        const images = PropertyManager.getPropertyImages(property);
        
        let amenitiesHTML = '';
        Object.entries(AppConfig.properties.amenities).forEach(([key, config]) => {
            if (property[key] === 'Si' || property[key] === 'x') {
                amenitiesHTML += `<span class="amenity">${config.icon} ${config.label}</span>`;
            }
        });
        
        return `
            <div class="property-card fade-in" data-property-id="${property.id_temporal}">
                <div class="property-image">
                    <img src="${mainImage}" alt="${property.titulo}" loading="lazy" 
                         onerror="this.src='${AppConfig.properties.defaultImage}'">
                    <div class="property-badge ${property.operacion}">
                        ${Utils.String.titleCase(property.operacion)}
                    </div>
                </div>
                
                <div class="property-content">
                    <h3 class="property-title">${property.titulo}</h3>
                    
                    <div class="property-location">
                        📍 ${property.barrio}
                    </div>
                    
                    <div class="property-price">
                        ${Utils.Number.formatCurrency(property.precio, property.moneda_precio)}
                        <span class="property-price-currency">${property.moneda_precio}</span>
                    </div>
                    
                    ${property.expensas > 0 ? `
                        <div class="property-expenses">
                            Expensas: ${Utils.Number.formatCurrency(property.expensas, property.moneda_expensas)}
                        </div>
                    ` : ''}
                    
                    <div class="property-details">
                        <div class="property-detail">
                            <span class="property-detail-icon">🛏️</span>
                            <span>${property.ambientes} ambientes</span>
                        </div>
                        <div class="property-detail">
                            <span class="property-detail-icon">📐</span>
                            <span>${property.metros_cuadrados} m²</span>
                        </div>
                        <div class="property-detail">
                            <span class="property-detail-icon">🏢</span>
                            <span>${Utils.String.titleCase(property.tipo)}</span>
                        </div>
                        <div class="property-detail">
                            <span class="property-detail-icon">🗺️</span>
                            <span>${property.direccion || property.barrio}</span>
                        </div>
                    </div>
                    
                    ${amenitiesHTML ? `
                        <div class="property-amenities">
                            ${amenitiesHTML}
                        </div>
                    ` : ''}
                    
                    ${property.descripcion ? `
                        <div class="property-description">
                            ${Utils.String.truncate(property.descripcion, 120)}
                        </div>
                    ` : ''}
                    
                    <div class="property-actions">
                        <button class="property-btn primary" onclick="app.showPropertyPhotos('${property.id_temporal}')">
                            📸 Ver Fotos (${images.length})
                        </button>
                        <button class="property-btn secondary" onclick="app.contactProperty('${property.id_temporal}')">
                            💬 Contactar
                        </button>
                        <button class="property-btn success" onclick="app.saveToFavorites('${property.id_temporal}')">
                            ❤️ Guardar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Configurar eventos de tarjetas de propiedades
    setupPropertyCardEvents() {
        // Los eventos se configuran automáticamente por los onclick en el HTML
    }

    // Mostrar estado "sin resultados"
    showNoResultsState() {
        const resultsContainer = Utils.DOM.$('#propertyResults');
        const statsElement = Utils.DOM.$('#searchStats');
        
        if (statsElement) {
            statsElement.style.display = 'none';
        }
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="no-results fade-in">
                    <div class="no-results-icon">🔍</div>
                    <h3>Escribe tu consulta para ver propiedades</h3>
                    <p>Usa el chatbot de arriba o los filtros de búsqueda avanzada</p>
                    
                    <div class="suggestions">
                        <h4>💡 Sugerencias:</h4>
                        <ul>
                            <li>Escribe "departamentos en Palermo"</li>
                            <li>Prueba "casa con pileta hasta 200k"</li>
                            <li>Busca "monoambiente alquiler"</li>
                            <li>Explora por barrio o tipo de propiedad</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    // Mostrar botón "cargar más"
    showLoadMoreButton(properties) {
        const resultsContainer = Utils.DOM.$('#propertyResults');
        if (!resultsContainer) return;
        
        const loadMoreHTML = `
            <div class="show-more-container fade-in">
                <p class="show-more-stats">
                    Mostrando ${AppConfig.search.resultsPerPage} de ${properties.length} propiedades
                </p>
                <button class="btn btn-primary btn-lg" onclick="app.loadMoreProperties(${JSON.stringify(properties).replace(/"/g, '&quot;')})">
                    📋 Ver Todas las Propiedades (${properties.length})
                </button>
            </div>
        `;
        
        resultsContainer.insertAdjacentHTML('beforeend', loadMoreHTML);
    }

    // Cargar más propiedades
    loadMoreProperties(allProperties) {
        const html = this.generatePropertyCardsHTML(allProperties);
        const resultsContainer = Utils.DOM.$('#propertyResults');
        
        if (resultsContainer) {
            // Remover el botón de "cargar más"
            const loadMoreContainer = resultsContainer.querySelector('.show-more-container');
            if (loadMoreContainer) {
                loadMoreContainer.remove();
            }
            
            // Reemplazar el contenido con todas las propiedades
            resultsContainer.innerHTML = html;
            
            // Animar entrada
            Utils.Animation.fadeIn(resultsContainer, 300);
            
            // Configurar eventos
            this.setupPropertyCardEvents();
        }
    }

    // Actualizar estadísticas de búsqueda
    updateSearchStats(count) {
        const statsElement = Utils.DOM.$('#searchStats');
        const countElement = Utils.DOM.$('#resultsCount');
        
        if (statsElement && countElement) {
            if (count > 0) {
                statsElement.style.display = 'block';
                countElement.textContent = count;
            } else {
                statsElement.style.display = 'none';
            }
        }
    }

    // Realizar búsqueda avanzada
    performAdvancedSearch() {
        const filters = this.collectFilterValues();
        
        ConfigUtils.debug('Realizando búsqueda avanzada:', filters);
        
        const results = PropertyManager.searchProperties(filters);
        
        // Mostrar en chatbot
        if (window.Chatbot) {
            const searchDescription = this.generateSearchDescription(filters);
            window.Chatbot.displayMessage(searchDescription, 'user');
            
            const response = window.Chatbot.generateSearchResponse(results, 'búsqueda avanzada', filters);
            window.Chatbot.displayMessage(response, 'bot');
        }
        
        // Mostrar resultados
        this.displaySearchResults(results);
        
        // Enviar evento personalizado
        const searchEvent = new CustomEvent('advancedSearch', {
            detail: { filters, results }
        });
        window.dispatchEvent(searchEvent);
    }

    // Recopilar valores de filtros
    collectFilterValues() {
        const filters = {
            barrios: [],
            tipos: [],
            operaciones: [],
            precio_min: null,
            precio_max: null,
            ambientes_min: null,
            amenities: []
        };
        
        // Barrio
        const barrioValue = Utils.DOM.$('#barrio-select')?.value;
        if (barrioValue && barrioValue.trim() !== '') {
            filters.barrios = [barrioValue];
        }
        
        // Tipo
        const tipoValue = Utils.DOM.$('#tipo-select')?.value;
        if (tipoValue && tipoValue.trim() !== '') {
            filters.tipos = [tipoValue];
        }
        
        // Operación
        const operacionValue = Utils.DOM.$('#operacion-select')?.value;
        if (operacionValue && operacionValue.trim() !== '') {
            filters.operaciones = [operacionValue];
        }
        
        // Precio mínimo
        const precioMinValue = Utils.DOM.$('#precio-min')?.value;
        if (precioMinValue && precioMinValue.trim() !== '' && !isNaN(parseInt(precioMinValue))) {
            filters.precio_min = parseInt(precioMinValue);
        }
        
        // Precio máximo
        const precioMaxValue = Utils.DOM.$('#precio-max')?.value;
        if (precioMaxValue && precioMaxValue.trim() !== '' && !isNaN(parseInt(precioMaxValue))) {
            filters.precio_max = parseInt(precioMaxValue);
        }
        
        // Ambientes mínimos
        const ambientesMinValue = Utils.DOM.$('#ambientes-min')?.value;
        if (ambientesMinValue && ambientesMinValue.trim() !== '' && !isNaN(parseInt(ambientesMinValue))) {
            filters.ambientes_min = parseInt(ambientesMinValue);
        }
        
        return filters;
    }

    // Generar descripción de búsqueda
    generateSearchDescription(filters) {
        let description = '🔍 Búsqueda avanzada realizada';
        
        if (filters.barrios.length > 0) description += ` - Barrios: ${filters.barrios.join(', ')}`;
        if (filters.tipos.length > 0) description += ` - Tipos: ${filters.tipos.join(', ')}`;
        if (filters.operaciones.length > 0) description += ` - Operación: ${filters.operaciones.join(', ')}`;
        if (filters.precio_min) description += ` - Precio desde: $${filters.precio_min.toLocaleString()}`;
        if (filters.precio_max) description += ` - Precio hasta: $${filters.precio_max.toLocaleString()}`;
        if (filters.ambientes_min) description += ` - Mín. ${filters.ambientes_min} ambientes`;
        
        return description;
    }

    // Resetear filtros
    resetFilters() {
        const filterElements = [
            '#barrio-select',
            '#tipo-select',
            '#operacion-select',
            '#precio-min',
            '#precio-max',
            '#ambientes-min'
        ];
        
        filterElements.forEach(selector => {
            const element = Utils.DOM.$(selector);
            if (element) {
                element.value = '';
                Utils.DOM.removeClass(element, 'filter-active');
            }
        });
        
        // Mostrar todas las propiedades
        this.showAllProperties();
        
        // Notificar en el chat
        if (window.Chatbot) {
            window.Chatbot.displayMessage('🧹 Filtros limpiados. Puedes realizar una nueva búsqueda.', 'bot');
        }
    }

    // Mostrar todas las propiedades
    showAllProperties() {
        const allProperties = PropertyManager.getAllProperties();
        this.displaySearchResults(allProperties);
        
        // Notificar en el chat
        if (window.Chatbot) {
            window.Chatbot.displayMessage(
                `📋 Mostrando todas las propiedades disponibles (${allProperties.length} propiedades)`,
                'bot'
            );
        }
    }

    // Mostrar fotos de una propiedad
    showPropertyPhotos(propertyId) {
        const property = PropertyManager.getPropertyById(propertyId);
        if (!property) return;
        
        const images = PropertyManager.getPropertyImages(property);
        
        if (images.length === 0) {
            if (window.Chatbot) {
                window.Chatbot.displayMessage(
                    `📷 La propiedad "${property.titulo}" no tiene fotos disponibles`,
                    'bot'
                );
            }
            return;
        }
        
        this.createPhotoModal(property, images);
    }

    // Crear modal de fotos
    createPhotoModal(property, images) {
        // Cerrar modal existente
        const existingModal = Utils.DOM.$('#photoModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="photoModal" class="photo-gallery active" onclick="app.closePhotoModal()">
                <div class="gallery-content" onclick="event.stopPropagation()">
                    <div class="gallery-header">
                        <h3 class="gallery-title">📸 ${property.titulo}</h3>
                        <button class="gallery-close" onclick="app.closePhotoModal()">×</button>
                    </div>
                    <div class="gallery-main">
                        <img src="${images[0]}" alt="${property.titulo}" class="gallery-main-image" id="mainImage">
                    </div>
                    <div class="gallery-thumbnails">
                        ${images.map((img, index) => `
                            <img src="${img}" 
                                 alt="Foto ${index + 1}" 
                                 class="gallery-thumbnail ${index === 0 ? 'active' : ''}"
                                 onclick="app.changeMainImage('${img}', this)">
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Agregar event listener para cerrar con ESC
        document.addEventListener('keydown', this.handleEscKey);
    }

    // Cerrar modal de fotos
    closePhotoModal() {
        const modal = Utils.DOM.$('#photoModal');
        if (modal) {
            Utils.Animation.fadeOut(modal, 300, () => {
                modal.remove();
            });
        }
        
        // Remover event listener
        document.removeEventListener('keydown', this.handleEscKey);
    }

    // Cambiar imagen principal
    changeMainImage(imageSrc, thumbnail) {
        const mainImage = Utils.DOM.$('#mainImage');
        const thumbnails = Utils.DOM.$$('.gallery-thumbnail');
        
        if (mainImage) {
            mainImage.src = imageSrc;
        }
        
        // Actualizar estado activo
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        if (thumbnail) {
            thumbnail.classList.add('active');
        }
    }

    // Manejar tecla ESC
    handleEscKey(event) {
        if (event.key === 'Escape') {
            this.closePhotoModal();
        }
    }

    // Contactar propiedad
    contactProperty(propertyId) {
        const property = PropertyManager.getPropertyById(propertyId);
        if (!property) return;
        
        const message = this.generateWhatsAppMessage(property);
        const whatsappUrl = ConfigUtils.createWhatsAppUrl(message);
        
        window.open(whatsappUrl, '_blank');
        
        // Notificar en el chat
        if (window.Chatbot) {
            window.Chatbot.displayMessage(
                `💬 Abriendo WhatsApp para contactar sobre "${property.titulo}"`,
                'bot'
            );
        }
    }

    // Generar mensaje de WhatsApp
    generateWhatsAppMessage(property) {
        return `Hola, me interesa la propiedad:

🏠 ${property.titulo}
📍 Ubicación: ${property.barrio}
💰 Precio: ${Utils.Number.formatCurrency(property.precio, property.moneda_precio)}
🛏️ Ambientes: ${property.ambientes}
📐 Superficie: ${property.metros_cuadrados} m²

¿Podrían proporcionarme más información?

ID Propiedad: ${property.id_temporal}`;
    }

    // Guardar en favoritos
    saveToFavorites(propertyId) {
        const favorites = Utils.Storage.get('favorites', []);
        
        if (!favorites.includes(propertyId)) {
            favorites.push(propertyId);
            Utils.Storage.set('favorites', favorites);
            
            if (window.Chatbot) {
                window.Chatbot.displayMessage(
                    `❤️ Propiedad guardada en favoritos`,
                    'bot'
                );
            }
        } else {
            if (window.Chatbot) {
                window.Chatbot.displayMessage(
                    `💡 Esta propiedad ya está en tus favoritos`,
                    'bot'
                );
            }
        }
    }

    // Manejar acciones rápidas
    handleQuickAction(action) {
        switch (action) {
            case 'showFavorites':
                this.showFavorites();
                break;
            case 'compareProperties':
                this.compareProperties();
                break;
            case 'exportResults':
                this.exportResults();
                break;
            case 'shareResults':
                this.shareResults();
                break;
        }
    }

    // Mostrar favoritos
    showFavorites() {
        const favorites = Utils.Storage.get('favorites', []);
        if (favorites.length === 0) {
            if (window.Chatbot) {
                window.Chatbot.displayMessage(
                    '📌 No tienes propiedades guardadas en favoritos',
                    'bot'
                );
            }
            return;
        }
        
        const favoriteProperties = PropertyManager.getAllProperties()
            .filter(property => favorites.includes(property.id_temporal));
        
        this.displaySearchResults(favoriteProperties);
        
        if (window.Chatbot) {
            window.Chatbot.displayMessage(
                `❤️ Mostrando ${favoriteProperties.length} propiedades en favoritos`,
                'bot'
            );
        }
    }

    // Comparar propiedades (placeholder)
    compareProperties() {
        if (window.Chatbot) {
            window.Chatbot.displayMessage(
                '🔄 Funcionalidad de comparación próximamente disponible',
                'bot'
            );
        }
    }

    // Exportar resultados (placeholder)
    exportResults() {
        if (window.Chatbot) {
            window.Chatbot.displayMessage(
                '📄 Funcionalidad de exportación próximamente disponible',
                'bot'
            );
        }
    }

    // Compartir resultados (placeholder)
    shareResults() {
        if (navigator.share) {
            navigator.share({
                title: 'Propiedades - Dante Propiedades',
                text: 'Mira estas propiedades increíbles',
                url: window.location.href
            });
        } else {
            // Fallback: copiar URL al portapapeles
            navigator.clipboard.writeText(window.location.href);
            if (window.Chatbot) {
                window.Chatbot.displayMessage(
                    '🔗 URL copiada al portapapeles',
                    'bot'
                );
            }
        }
    }

    // Búsqueda instantánea
    performInstantSearch(query) {
        const filters = PropertyManager.processNaturalLanguageQuery(query);
        const results = PropertyManager.searchProperties(filters);
        
        this.displaySearchResults(results.slice(0, 6)); // Mostrar solo 6 resultados
        
        if (window.Chatbot) {
            window.Chatbot.displayMessage(
                `🔍 Búsqueda instantánea: "${query}" - ${results.length} resultados`,
                'bot'
            );
        }
    }

    // Limpiar búsqueda instantánea
    clearInstantSearch() {
        this.showAllProperties();
    }

    // Manejar redimensionamiento
    handleResize() {
        // Recalcular posiciones de elementos si es necesario
        this.repositionElements();
    }

    // Reposicionar elementos
    repositionElements() {
        // Cerrar tooltips en redimensionamiento
        this.hideTooltip();
        
        // Ajustar modal de fotos si está abierto
        const modal = Utils.DOM.$('#photoModal');
        if (modal && modal.classList.contains('active')) {
            // Reajustar posición si es necesario
        }
    }

    // Manejar scroll
    handleScroll() {
        // Implementar comportamientos de scroll si es necesario
        // Por ejemplo, lazy loading adicional, mostrar/ocultar elementos, etc.
    }

    // Manejar errores globales
    handleGlobalError(error) {
        ConfigUtils.error('Error global capturado:', error);
        
        // Mostrar notificación de error no intrusiva
        this.showErrorNotification(error);
    }

    // Mostrar notificación de error
    showErrorNotification(error) {
        const notification = Utils.DOM.createElement('div', {
            className: 'error-notification',
            style: `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--danger-color);
                color: white;
                padding: 15px 20px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                z-index: 10000;
                max-width: 300px;
                animation: slideInRight 0.3s ease;
            `
        }, `
            <strong>Error:</strong><br>
            ${error.message || 'Ha ocurrido un error inesperado'}
        `);
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Manejar promesas rechazadas no manejadas
    handleUnhandledRejection(reason) {
        ConfigUtils.error('Promesa rechazada no manejada:', reason);
    }

    // Obtener estado de la aplicación
    getState() {
        return {
            isInitialized: this.isInitialized,
            components: { ...this.components },
            lastActivity: this.lastMessageTime
        };
    }

    // ===== NUEVAS FUNCIONES INTEGRADAS =====
    
    // Configurar búsqueda avanzada
    setupAdvancedSearch() {
        const searchBtn = Utils.DOM.$('#searchBtn');
        const resetBtn = Utils.DOM.$('#resetBtn');
        const showAllBtn = Utils.DOM.$('#showAllBtn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.executeAdvancedSearch());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.showAllProperties());
        }
        
        // Llenar filtros dinámicamente cuando estén disponibles
        this.populateFiltersWhenReady();
    }
    
    // Ejecutar búsqueda avanzada
    executeAdvancedSearch() {
        const filters = this.getAdvancedFilters();
        const properties = PropertyManager.getFilteredProperties(filters);
        
        this.displayProperties(properties);
        this.updateSearchStats(properties.length);
        
        // También buscar en el chatbot
        if (window.Chatbot) {
            const filterDescription = this.describeFilters(filters);
            window.Chatbot.displaySearchResults(properties, filterDescription);
        }
    }
    
    // Obtener filtros de la búsqueda avanzada
    getAdvancedFilters() {
        const filters = {
            barrios: [],
            tipos: [],
            operaciones: [],
            precio_min: null,
            precio_max: null,
            ambientes_min: null,
            amenities: []
        };
        
        // Barrio
        const barrioSelect = Utils.DOM.$('#barrio-select');
        if (barrioSelect && barrioSelect.value) {
            filters.barrios = [barrioSelect.value];
        }
        
        // Tipo
        const tipoSelect = Utils.DOM.$('#tipo-select');
        if (tipoSelect && tipoSelect.value) {
            filters.tipos = [tipoSelect.value];
        }
        
        // Operación
        const operacionSelect = Utils.DOM.$('#operacion-select');
        if (operacionSelect && operacionSelect.value) {
            filters.operaciones = [operacionSelect.value];
        }
        
        // Precio mínimo
        const precioMin = Utils.DOM.$('#precio-min');
        if (precioMin && precioMin.value) {
            filters.precio_min = parseInt(precioMin.value);
        }
        
        // Precio máximo
        const precioMax = Utils.DOM.$('#precio-max');
        if (precioMax && precioMax.value) {
            filters.precio_max = parseInt(precioMax.value);
        }
        
        // Ambientes mínimos
        const ambientesMin = Utils.DOM.$('#ambientes-min');
        if (ambientesMin && ambientesMin.value) {
            filters.ambientes_min = parseInt(ambientesMin.value);
        }
        
        return filters;
    }
    
    // Describir filtros para mostrar
    describeFilters(filters) {
        const parts = [];
        
        if (filters.barrios.length > 0) parts.push(`en ${filters.barrios[0]}`);
        if (filters.tipos.length > 0) parts.push(`${filters.tipos[0]}s`);
        if (filters.operaciones.length > 0) parts.push(`de ${filters.operaciones[0]}`);
        if (filters.precio_min) parts.push(`desde $${filters.precio_min.toLocaleString()}`);
        if (filters.precio_max) parts.push(`hasta $${filters.precio_max.toLocaleString()}`);
        if (filters.ambientes_min) parts.push(`${filters.ambientes_min}+ ambientes`);
        
        return parts.join(' ');
    }
    
    // Mostrar todas las propiedades
    showAllProperties() {
        const properties = PropertyManager.getAllProperties();
        this.displayProperties(properties);
        this.updateSearchStats(properties.length);
        
        if (window.Chatbot) {
            window.Chatbot.displaySearchResults(properties, 'todas las propiedades');
        }
    }
    
    // Resetear filtros
    resetFilters() {
        // Limpiar selects
        ['barrio-select', 'tipo-select', 'operacion-select'].forEach(id => {
            const element = Utils.DOM.$('#' + id);
            if (element) element.value = '';
        });
        
        // Limpiar inputs numéricos
        ['precio-min', 'precio-max', 'ambientes-min'].forEach(id => {
            const element = Utils.DOM.$('#' + id);
            if (element) element.value = '';
        });
        
        // Mostrar todas las propiedades
        this.showAllProperties();
    }
    
    // Mostrar propiedades en el área de resultados
    displayProperties(properties) {
        const resultsContainer = Utils.DOM.$('#propertyResults');
        if (!resultsContainer) return;
        
        if (properties.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>🔍 No se encontraron propiedades</h3>
                    <p>Intenta ajustar tus filtros de búsqueda</p>
                </div>
            `;
            return;
        }
        
        const propertiesHTML = properties.map(property => 
            PropertyManager.createPropertyCard(property)
        ).join('');
        
        resultsContainer.innerHTML = propertiesHTML;
        
        // Scroll suave a los resultados
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Actualizar estadísticas de búsqueda
    updateSearchStats(count) {
        const resultsCount = Utils.DOM.$('#resultsCount');
        if (resultsCount) {
            resultsCount.textContent = count;
        }
    }
    
    // Llenar filtros cuando estén disponibles
    async populateFiltersWhenReady() {
        let attempts = 0;
        while (attempts < 50) {
            if (PropertyManager.getAvailableFilters) {
                PropertyManager.populateDynamicFilters();
                ConfigUtils.debug('Filtros dinámicos poblados');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
    
    // Manejar eventos del sistema de menú
    setupMenuSystemIntegration() {
        // Registrar callback para acciones del menú
        if (window.MenuSystem && window.MenuSystem.onAction) {
            window.MenuSystem.onAction((actionType, data) => {
                this.handleMenuAction(actionType, data);
            });
        }
        
        // Configurar navegación numérica
        this.setupNumericNavigation();
    }
    
    // Manejar acciones del menú
    handleMenuAction(actionType, data) {
        ConfigUtils.debug('Manejando acción del menú:', { actionType, data });
        
        switch (actionType) {
            case 'FILTER_APPLIED':
                this.executeAdvancedSearch();
                break;
            case 'ALL_PROPERTIES_REQUESTED':
                this.showAllProperties();
                break;
            case 'CONTACT_REQUESTED':
                this.showContactInfo();
                break;
        }
    }
    
    // Configurar navegación numérica
    setupNumericNavigation() {
        // Escuchar entrada numérica en el input del chat
        const messageInput = Utils.DOM.$('#messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key >= '0' && e.key <= '9' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                    // Permitir navegación numérica
                    ConfigUtils.debug('Navegación numérica:', e.key);
                }
            });
        }
    }
    
    // Mostrar información de contacto
    showContactInfo() {
        if (window.Chatbot && window.Chatbot.showContactInfo) {
            window.Chatbot.showContactInfo();
        }
    }
}

// Crear instancia global de la aplicación
window.app = new App();

// Hacer disponible globalmente para onclick handlers
window.app = window.app;