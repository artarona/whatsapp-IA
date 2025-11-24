// ===== ADMINISTRADOR DE PROPIEDADES =====

class PropertyManager {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.availableFilters = {
            barrios: [],
            tipos: [],
            operaciones: [],
            amenidades: []
        };
        this.isLoading = false;
        this.lastLoadTime = null;
        
        this.init();
    }

    // Inicializar el administrador
    async init() {
        ConfigUtils.info('Inicializando PropertyManager...');
        
        try {
            await this.loadProperties();
            this.generateAvailableFilters();
            ConfigUtils.info(`PropertyManager inicializado con ${this.properties.length} propiedades`);
        } catch (error) {
            ConfigUtils.error('Error inicializando PropertyManager:', error);
            throw error;
        }
    }

    // Cargar propiedades desde el archivo JSON
    async loadProperties() {
        if (this.isLoading) {
            ConfigUtils.warn('Ya se está cargando las propiedades...');
            return;
        }

        this.isLoading = true;
        
        try {
            ConfigUtils.info('Cargando propiedades desde:', AppConfig.api.properties);
            
            const response = await fetch(AppConfig.api.properties);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Los datos de propiedades no son un array válido');
            }
            
            // Validar y normalizar propiedades
            this.properties = data.map(property => this.normalizeProperty(property));
            
            this.filteredProperties = [...this.properties];
            this.lastLoadTime = new Date();
            
            ConfigUtils.info(`Propiedades cargadas: ${this.properties.length}`);
            
            // Generar filtros disponibles ANTES de poblar el DOM
            this.generateAvailableFilters();
            
            // Poblar filtros automáticamente
            this.populateFiltersAfterLoad();
            
            // Notificar que las propiedades han sido cargadas
            this.notifyPropertiesLoaded();
            
            return this.properties;
            
        } catch (error) {
            ConfigUtils.error('Error cargando propiedades:', error);
            
            // Fallback con datos de ejemplo
            this.loadFallbackProperties();
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    // Normalizar propiedad para asegurar estructura consistente
    normalizeProperty(property) {
        const normalized = {
            id_temporal: property.id_temporal || Utils.randomId(),
            titulo: Utils.String.clean(property.titulo || 'Sin título'),
            barrio: Utils.String.clean(property.barrio || 'No especificado'),
            precio: Number(property.precio) || 0,
            ambientes: Number(property.ambientes) || 0,
            metros_cuadrados: Number(property.metros_cuadrados) || 0,
            operacion: Utils.String.clean(property.operacion || 'venta'),
            tipo: Utils.String.clean(property.tipo || 'propiedad'),
            descripcion: Utils.String.clean(property.descripcion || ''),
            direccion: Utils.String.clean(property.direccion || ''),
            antiguedad: Number(property.antiguedad) || 0,
            estado: Utils.String.clean(property.estado || ''),
            orientacion: Utils.String.clean(property.orientacion || ''),
            piso: Utils.String.clean(property.piso || ''),
            expensas: Number(property.expensas) || 0,
            moneda_precio: Utils.String.clean(property.moneda_precio || 'USD'),
            moneda_expensas: Utils.String.clean(property.moneda_expensas || 'ARS'),
            amenities: Utils.String.clean(property.amenities || ''),
            cochera: property.cochera || '',
            balcon: property.balcon || '',
            pileta: property.pileta || '',
            acepta_mascotas: property.acepta_mascotas || '',
            aire_acondicionado: property.aire_acondicionado || '',
            info_multimedia: Utils.String.clean(property.info_multimedia || ''),
            documentos: Array.isArray(property.documentos) ? property.documentos : [],
            fotos: Array.isArray(property.fotos) ? property.fotos : [],
            fecha_procesamiento: property.fecha_procesamiento || new Date().toISOString()
        };

        // Procesar fotos
        normalized.fotos = this.processPropertyImages(normalized);
        
        return normalized;
    }

    // Procesar imágenes de la propiedad
    processPropertyImages(property) {
        const defaultImage = AppConfig.properties.defaultImage;
        
        if (!Array.isArray(property.fotos) || property.fotos.length === 0) {
            // Si no hay fotos específicas, intentar generar una imagen por defecto
            return [this.generateDefaultImage(property)];
        }
        
        // Verificar que las imágenes existan, si no usar por defecto
        const validPhotos = property.fotos.filter(foto => {
            const isValidFormat = AppConfig.properties.imageFormats.some(format => 
                foto.toLowerCase().endsWith(format.toLowerCase())
            );
            return isValidFormat;
        });
        
        return validPhotos.length > 0 ? validPhotos : [defaultImage];
    }

    // Generar imagen por defecto para una propiedad
    generateDefaultImage(property) {
        const type = property.tipo.toLowerCase();
        const tipoMapping = {
            'casa': 'casa_familiar',
            'departamento': 'departamento_palermo',
            'monoambiente': 'monoambiente',
            'oficina': 'oficina_microcentro',
            'local': 'local_comercial',
            'terreno': 'terreno_urbano',
            'ph': 'ph_lujo'
        };
        
        const defaultImageName = tipoMapping[type] || 'imagen-propiedad';
        return `${AppConfig.api.images}${defaultImageName}.jpg`;
    }

    // Cargar propiedades de fallback en caso de error
    loadFallbackProperties() {
        ConfigUtils.warn('Cargando propiedades de fallback...');
        
        this.properties = [{
            id_temporal: "UF000",
            titulo: "Casa en Parque Avellaneda",
            barrio: "Parque Avellaneda",
            precio: 169000,
            ambientes: 3,
            metros_cuadrados: 306,
            operacion: "venta",
            tipo: "casa",
            descripcion: "Ubicada en una zona tranquila y residencial.",
            direccion: "Espinillo al 1400",
            moneda_precio: "USD",
            fotos: ["imgs/UF000-1.jpeg"]
        }];
        
        this.filteredProperties = [...this.properties];
        this.generateAvailableFilters();
    }

    // Generar filtros disponibles
    generateAvailableFilters() {
        const barrios = Utils.Array.unique(
            this.properties.map(p => p.barrio).filter(Boolean)
        ).sort();
        
        const tipos = Utils.Array.unique(
            this.properties.map(p => p.tipo).filter(Boolean)
        ).sort();
        
        const operaciones = Utils.Array.unique(
            this.properties.map(p => p.operacion).filter(Boolean)
        ).sort();
        
        // Generar amenidades disponibles
        const amenidadesSet = new Set();
        this.properties.forEach(property => {
            Object.keys(AppConfig.properties.amenities).forEach(amenity => {
                if (property[amenity] === 'Si' || property[amenity] === 'x') {
                    amenidadesSet.add(amenity);
                }
            });
        });
        
        this.availableFilters = {
            barrios,
            tipos,
            operaciones,
            amenidades: Array.from(amenidadesSet).sort()
        };
        
        ConfigUtils.debug('Filtros generados:', this.availableFilters);
    }

    // Obtener todas las propiedades
    getAllProperties() {
        return [...this.properties];
    }

    // Obtener propiedades filtradas
    getFilteredProperties() {
        return [...this.filteredProperties];
    }

    // Buscar propiedades por filtros
    searchProperties(filters = {}) {
        ConfigUtils.debug('Buscando propiedades con filtros:', filters);
        
        let results = [...this.properties];
        
        // Filtrar por barrios
        if (filters.barrios && filters.barrios.length > 0) {
            results = results.filter(property => 
                filters.barrios.includes(property.barrio)
            );
        }
        
        // Filtrar por tipos
        if (filters.tipos && filters.tipos.length > 0) {
            results = results.filter(property => 
                filters.tipos.includes(property.tipo)
            );
        }
        
        // Filtrar por operaciones
        if (filters.operaciones && filters.operaciones.length > 0) {
            results = results.filter(property => 
                filters.operaciones.includes(property.operacion)
            );
        }
        
        // Filtrar por precio mínimo
        if (filters.precio_min !== null && filters.precio_min !== undefined) {
            results = results.filter(property => 
                property.precio >= filters.precio_min
            );
        }
        
        // Filtrar por precio máximo
        if (filters.precio_max !== null && filters.precio_max !== undefined) {
            results = results.filter(property => 
                property.precio <= filters.precio_max
            );
        }
        
        // Filtrar por ambientes mínimos
        if (filters.ambientes_min !== null && filters.ambientes_min !== undefined) {
            results = results.filter(property => 
                property.ambientes >= filters.ambientes_min
            );
        }
        
        // Filtrar por amenidades
        if (filters.amenities && filters.amenities.length > 0) {
            results = results.filter(property => {
                return filters.amenities.every(amenity => {
                    const propertyValue = property[amenity];
                    return propertyValue === 'Si' || propertyValue === 'x' || propertyValue === true;
                });
            });
        }
        
        this.filteredProperties = results;
        ConfigUtils.info(`Búsqueda completada: ${results.length} propiedades encontradas`);
        
        return results;
    }

    // Buscar propiedad por ID
    getPropertyById(id) {
        return this.properties.find(property => property.id_temporal === id);
    }

    // Obtener propiedades por tipo
    getPropertiesByType(type) {
        return this.properties.filter(property => 
            property.tipo.toLowerCase() === type.toLowerCase()
        );
    }

    // Obtener propiedades por barrio
    getPropertiesByBarrio(barrio) {
        return this.properties.filter(property => 
            property.barrio === barrio
        );
    }

    // Obtener propiedades por rango de precio
    getPropertiesByPriceRange(min, max) {
        return this.properties.filter(property => {
            const price = property.precio || 0;
            return price >= min && price <= max;
        });
    }

    // Obtener imagen principal de una propiedad
    getPropertyMainImage(property) {
        if (!property) return AppConfig.properties.defaultImage;
        
        if (property.fotos && property.fotos.length > 0) {
            return property.fotos[0];
        }
        
        return this.generateDefaultImage(property);
    }

    // Obtener todas las imágenes de una propiedad
    getPropertyImages(property) {
        if (!property) return [];
        
        return property.fotos && property.fotos.length > 0 
            ? property.fotos 
            : [this.generateDefaultImage(property)];
    }

    // Procesar consulta de lenguaje natural
    processNaturalLanguageQuery(query) {
        if (!query || typeof query !== 'string') {
            return {};
        }
        
        const lowerQuery = query.toLowerCase();
        const filters = {
            barrios: [],
            tipos: [],
            operaciones: [],
            precio_min: null,
            precio_max: null,
            ambientes_min: null,
            amenities: []
        };

        // Detectar barrios
        this.availableFilters.barrios.forEach(barrio => {
            if (lowerQuery.includes(barrio.toLowerCase())) {
                filters.barrios.push(barrio);
            }
        });

        // Detectar tipos
        this.availableFilters.tipos.forEach(tipo => {
            if (lowerQuery.includes(tipo.toLowerCase())) {
                filters.tipos.push(tipo);
            }
        });

        // Detectar operación
        if (lowerQuery.includes('venta') || lowerQuery.includes('comprar')) {
            filters.operaciones.push('venta');
        } else if (lowerQuery.includes('alquiler') || lowerQuery.includes('alquilar')) {
            filters.operaciones.push('alquiler');
        }

        // Detectar precios
        const numbers = Utils.String.extractNumbers(query);
        if (numbers.length > 0) {
            if (lowerQuery.includes('hasta') || lowerQuery.includes('menor') || lowerQuery.includes('máximo')) {
                filters.precio_max = Math.max(...numbers);
            } else if (lowerQuery.includes('desde') || lowerQuery.includes('más')) {
                filters.precio_min = Math.min(...numbers);
            } else if (numbers.length >= 2) {
                filters.precio_min = Math.min(...numbers);
                filters.precio_max = Math.max(...numbers);
            }
        }

        // Detectar ambientes
        const ambienteMatch = query.match(/(\d+)\s*ambiente/i);
        if (ambienteMatch) {
            filters.ambientes_min = parseInt(ambienteMatch[1]);
        }

        // Detectar amenidades
        this.availableFilters.amenidades.forEach(amenity => {
            if (lowerQuery.includes(amenity.replace('_', ' ')) || 
                lowerQuery.includes(amenity.replace('_', ''))) {
                filters.amenities.push(amenity);
            }
        });

        ConfigUtils.debug('Filtros extraídos de consulta:', { query, filters });
        return filters;
    }

    // ===== FUNCIONES DINÁMICAS INTEGRADAS DESDE APP.JS =====
    
    // Inicializar sistema dinámico
    async initializeDynamic() {
        try {
            await this.loadProperties();
            this.generateDynamicData();
            ConfigUtils.info('Sistema dinámico inicializado correctamente');
            return true;
        } catch (error) {
            ConfigUtils.error('Error inicializando sistema dinámico:', error);
            return false;
        }
    }

    // Generar datos dinámicos
    generateDynamicData() {
        this.generateDynamicTypes();
        this.generateDynamicNeighborhoods();
        this.generateDynamicOperations();
        this.generateDynamicAmenities();
        this.generateAvailableImages();
    }

    // Generar tipos dinámicamente
    generateDynamicTypes() {
        const tipos = [...new Set(this.properties.map(p => p.tipo))];
        this.dynamicTypes = tipos.map(tipo => ({
            value: tipo,
            label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            images: this.getImagesForType(tipo)
        }));
    }

    // Generar barrios dinámicamente
    generateDynamicNeighborhoods() {
        this.dynamicNeighborhoods = [...new Set(
            this.properties.map(p => p.barrio)
        )].sort();
    }

    // Generar operaciones dinámicamente
    generateDynamicOperations() {
        this.dynamicOperations = [...new Set(
            this.properties.map(p => p.operacion)
        )];
    }

    // Generar amenidades dinámicamente
    generateDynamicAmenities() {
        const amenities = new Set();
        
        this.properties.forEach(property => {
            if (property.pileta === 'Si') amenities.add('pileta');
            if (property.cochera === 'x') amenities.add('cochera');
            if (property.balcon === 'x') amenities.add('balcon');
            if (property.aire_acondicionado === 'Si') amenities.add('aire_acondicionado');
            if (property.acepta_mascotas === 'Si') amenities.add('acepta_mascotas');
        });
        
        this.dynamicAmenities = Array.from(amenities);
    }

    // Generar imágenes disponibles
    generateAvailableImages() {
        const images = new Set();
        
        this.properties.forEach(property => {
            if (property.fotos && Array.isArray(property.fotos)) {
                property.fotos.forEach(foto => images.add(foto));
            }
        });
        
        this.availableImages = Array.from(images);
    }

    // Obtener imágenes para un tipo específico
    getImagesForType(tipo) {
        const propiedadesDelTipo = this.properties.filter(p => p.tipo === tipo);
        const images = [];
        
        propiedadesDelTipo.forEach(property => {
            if (property.fotos && Array.isArray(property.fotos)) {
                property.fotos.forEach(foto => images.push(foto));
            }
        });
        
        // Si no hay imágenes específicas, usar genéricas
        if (images.length === 0) {
            return this.generateGenericImages(tipo);
        }
        
        return images;
    }

    // Generar imágenes genéricas para tipos
    generateGenericImages(tipo) {
        const genericImages = {
            casa: ['imgs/casa_familiar_3.jpg', 'imgs/casa_familiar_6.jpg', 'imgs/casa_familiar_8.jpg'],
            departamento: ['imgs/departamento_palermo_1.jpg', 'imgs/departamento_palermo_4.jpg', 'imgs/departamento_palermo_7.jpg'],
            monoambiente: ['imgs/monoambiente_1.jpg', 'imgs/monoambiente_3.jpg', 'imgs/monoambiente_8.JPEG'],
            apartamento: ['imgs/apartamento_lujo_0.jpg', 'imgs/apartamento_lujo_2.jpg', 'imgs/apartamento_lujo_7.jpg'],
            edificio: ['imgs/edificio_1.jpg', 'imgs/edificio_7.jpg', 'imgs/edificio_8.jpg']
        };
        
        return genericImages[tipo] || ['imgs/imagen-propiedad.svg'];
    }

    // Función hash para consistencia en selección de imágenes
    getHashCode(str) {
        let hash = 0;
        if (str.length == 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    // Obtener imagen principal de propiedad (mejorada)
    getPropertyMainImage(property) {
        if (!property) return AppConfig.properties.defaultImage;
        
        // Primera opción: usar fotos reales
        if (property.fotos && property.fotos.length > 0) {
            const index = Math.abs(this.getHashCode(property.id_temporal)) % property.fotos.length;
            return property.fotos[index];
        }
        
        // Segunda opción: buscar imágenes del mismo tipo
        const imagesOfType = this.getImagesForType(property.tipo);
        if (imagesOfType.length > 0) {
            const index = Math.abs(this.getHashCode(property.id_temporal)) % imagesOfType.length;
            return imagesOfType[index];
        }
        
        // Tercera opción: imagen por defecto
        return AppConfig.properties.defaultImage;
    }

    // Crear HTML de imagen de propiedad
    createPropertyImageHTML(property) {
        const imageSrc = this.getPropertyMainImage(property);
        
        return `
            <div class="property-image">
                <img src="${imageSrc}" 
                     alt="${property.titulo}" 
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;"
                     onerror="this.src='imgs/imagen-propiedad.svg'"
                     loading="lazy">
            </div>
        `;
    }

    // Crear tarjeta completa de propiedad (mejorada)
    createPropertyCard(property) {
        return `
            <div class="property-card" data-property-id="${property.id_temporal}">
                ${this.createPropertyImageHTML(property)}
                <h3>${property.titulo}</h3>
                <div class="property-info">
                    <div class="info-item">
                        <span>📍</span>
                        <span><strong>Ubicación:</strong> ${property.barrio}</span>
                    </div>
                    <div class="info-item">
                        <span>💰</span>
                        <span><strong>Precio:</strong> $${property.precio ? property.precio.toLocaleString() : 'N/A'} ${property.moneda_precio || 'USD'}</span>
                    </div>
                    <div class="info-item">
                        <span>🛏️</span>
                        <span><strong>Ambientes:</strong> ${property.ambientes || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span>📐</span>
                        <span><strong>Superficie:</strong> ${property.metros_cuadrados || 'N/A'} m²</span>
                    </div>
                    <div class="info-item">
                        <span>🏢</span>
                        <span><strong>Tipo:</strong> ${property.tipo ? property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1) : 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span>💰</span>
                        <span><strong>Operación:</strong> ${property.operacion ? property.operacion.charAt(0).toUpperCase() + property.operacion.slice(1) : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="property-amenities">
                    ${property.pileta === 'Si' ? '<span class="amenity">🏊 Pileta</span>' : ''}
                    ${property.cochera === 'x' ? '<span class="amenity">🚗 Cochera</span>' : ''}
                    ${property.balcon === 'x' ? '<span class="amenity">🏞️ Balcón</span>' : ''}
                    ${property.aire_acondicionado === 'Si' ? '<span class="amenity">❄️ Aire Acondicionado</span>' : ''}
                    ${property.acepta_mascotas === 'Si' ? '<span class="amenity">🐕 Mascotas</span>' : ''}
                </div>
                
                ${property.descripcion ? `<p style="color: #666; margin-bottom: 15px;">${property.descripcion}</p>` : ''}
                
                <div class="property-actions">
                    <a href="#" class="btn btn-primary" onclick="showPropertyGallery('${property.id_temporal}')">
                        📸 Ver Fotos
                    </a>
                    <a href="${ConfigUtils.createWhatsAppUrl(`Hola, me interesa obtener más información sobre ${property.titulo}`)}" class="btn btn-secondary" target="_blank">
                        💬 Contactar
                    </a>
                    <a href="#" class="btn btn-secondary" onclick="saveToFavorites('${property.id_temporal}')">
                        ❤️ Guardar
                    </a>
                </div>
            </div>
        `;
    }

    // Llenar filtros dinámicamente
    populateDynamicFilters() {
        this.populateNeighborhoodSelector();
        this.populateTypeSelector();
    }

    // Llenar selector de barrios
    populateNeighborhoodSelector() {
        const neighborhoodSelect = document.getElementById('barrio-select');
        if (!neighborhoodSelect) return;
        
        // Limpiar opciones existentes excepto la primera
        while (neighborhoodSelect.children.length > 1) {
            neighborhoodSelect.removeChild(neighborhoodSelect.lastChild);
        }
        
        // Agregar opciones dinámicas
        this.availableFilters.barrios.forEach(barrio => {
            const option = document.createElement('option');
            option.value = barrio;
            option.textContent = barrio;
            neighborhoodSelect.appendChild(option);
        });
    }

    // Llenar selector de tipos
    populateTypeSelector() {
        const typeSelect = document.getElementById('tipo-select');
        if (!typeSelect) return;
        
        // Limpiar opciones existentes excepto la primera
        while (typeSelect.children.length > 1) {
            typeSelect.removeChild(typeSelect.lastChild);
        }
        
        // Agregar opciones dinámicas
        this.availableFilters.tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            typeSelect.appendChild(option);
        });
    }

    // Llenar selector de operaciones
    populateOperationSelector() {
        const operationSelect = document.getElementById('operacion-select');
        if (!operationSelect) return;
        
        // Limpiar opciones existentes excepto la primera
        while (operationSelect.children.length > 1) {
            operationSelect.removeChild(operationSelect.lastChild);
        }
        
        // Agregar opciones dinámicas
        this.availableFilters.operaciones.forEach(operacion => {
            const option = document.createElement('option');
            option.value = operacion;
            option.textContent = operacion.charAt(0).toUpperCase() + operacion.slice(1);
            operationSelect.appendChild(option);
        });
    }

    // Obtener propiedades filtradas (mejorada)
    getFilteredProperties(filters) {
        return this.properties.filter(property => {
            // Filtrar por barrios
            if (filters.barrios && filters.barrios.length > 0 && !filters.barrios.includes(property.barrio)) {
                return false;
            }
            
            // Filtrar por tipos
            if (filters.tipos && filters.tipos.length > 0 && !filters.tipos.includes(property.tipo)) {
                return false;
            }
            
            // Filtrar por operaciones
            if (filters.operaciones && filters.operaciones.length > 0 && !filters.operaciones.includes(property.operacion)) {
                return false;
            }
            
            // Filtrar por precio
            if (filters.precio_min && property.precio < filters.precio_min) {
                return false;
            }
            if (filters.precio_max && property.precio > filters.precio_max) {
                return false;
            }
            
            // Filtrar por ambientes
            if (filters.ambientes_min && property.ambientes < filters.ambientes_min) {
                return false;
            }
            
            // Filtrar por amenidades
            if (filters.amenities && filters.amenities.length > 0) {
                const hasAllAmenities = filters.amenities.every(amenity => {
                    const propertyValue = property[amenity];
                    return propertyValue === 'Si' || propertyValue === 'x' || propertyValue === true;
                });
                if (!hasAllAmenities) return false;
            }
            
            return true;
        });
    }

    // Obtener estadísticas del inventario
    getInventoryStats() {
        const total = this.properties.length;
        const stats = {
            total,
            porTipo: {},
            porBarrio: {},
            porOperacion: {},
            precioPromedio: 0,
            ambientesPromedio: 0,
            metrosPromedio: 0
        };

        let precioTotal = 0;
        let ambientesTotal = 0;
        let metrosTotal = 0;

        this.properties.forEach(property => {
            // Por tipo
            stats.porTipo[property.tipo] = (stats.porTipo[property.tipo] || 0) + 1;
            
            // Por barrio
            stats.porBarrio[property.barrio] = (stats.porBarrio[property.barrio] || 0) + 1;
            
            // Por operación
            stats.porOperacion[property.operacion] = (stats.porOperacion[property.operacion] || 0) + 1;
            
            // Calcular promedios
            if (property.precio > 0) precioTotal += property.precio;
            if (property.ambientes > 0) ambientesTotal += property.ambientes;
            if (property.metros_cuadrados > 0) metrosTotal += property.metros_cuadrados;
        });

        // Calcular promedios
        stats.precioPromedio = precioTotal / total;
        stats.ambientesPromedio = ambientesTotal / total;
        stats.metrosPromedio = metrosTotal / total;

        return stats;
    }

    // Obtener filtros disponibles
    getAvailableFilters() {
        return { ...this.availableFilters };
    }

    // Refrescar datos
    async refresh() {
        ConfigUtils.info('Refrescando datos de propiedades...');
        await this.loadProperties();
        return this.properties;
    }

    // Notificar que las propiedades han sido cargadas
    notifyPropertiesLoaded() {
        const event = new CustomEvent('propertiesLoaded', {
            detail: {
                properties: this.properties,
                filters: this.availableFilters,
                timestamp: this.lastLoadTime
            }
        });
        window.dispatchEvent(event);
    }

    // Verificar si está cargando
    getLoadingState() {
        return this.isLoading;
    }

    // Poblar filtros automáticamente después de cargar
    populateFiltersAfterLoad() {
        ConfigUtils.debug('Poblando filtros automáticamente...');
        
        // Poblar selector de barrios
        this.populateNeighborhoodSelector();
        
        // Poblar selector de tipos
        this.populateTypeSelector();
        
        // Poblar selector de operaciones
        this.populateOperationSelector();
        
        // Notificar que los filtros están listos
        const event = new CustomEvent('filtersPopulated', {
            detail: {
                filters: this.availableFilters,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
        
        ConfigUtils.info('Filtros poblados automáticamente');
    }

    // Obtener tiempo de última carga
    getLastLoadTime() {
        return this.lastLoadTime;
    }

    // Validar propiedad
    validateProperty(property) {
        const errors = [];
        
        if (!property.titulo || Utils.String.isEmpty(property.titulo)) {
            errors.push('El título es requerido');
        }
        
        if (!property.barrio || Utils.String.isEmpty(property.barrio)) {
            errors.push('El barrio es requerido');
        }
        
        if (!Utils.Number.isNumber(property.precio)) {
            errors.push('El precio debe ser un número');
        }
        
        if (!Utils.Array.isArray(property.fotos) || property.fotos.length === 0) {
            errors.push('Al menos una foto es requerida');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Crear instancia global
window.PropertyManager = new PropertyManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyManager;
}