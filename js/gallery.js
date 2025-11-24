// ===== SISTEMA DE GALERÍA DE IMÁGENES =====

class PropertyGallery {
    constructor() {
        this.currentImages = [];
        this.currentIndex = 0;
        this.currentProperty = null;
        this.isOpen = false;
        
        this.createGalleryElements();
        this.setupEventListeners();
        
        ConfigUtils.info('Galería de imágenes inicializada');
    }

    // Crear elementos HTML de la galería
    createGalleryElements() {
        const galleryHTML = `
            <!-- Overlay de la galería -->
            <div id="galleryOverlay" class="gallery-overlay" style="display: none;">
                <div class="gallery-container">
                    <!-- Botón cerrar -->
                    <button class="gallery-close" id="galleryClose">&times;</button>
                    
                    <!-- Imagen principal -->
                    <div class="gallery-main">
                        <img id="galleryMainImage" src="" alt="">
                        <button class="gallery-nav gallery-prev" id="galleryPrev">&#10094;</button>
                        <button class="gallery-nav gallery-next" id="galleryNext">&#10095;</button>
                    </div>
                    
                    <!-- Miniaturas -->
                    <div class="gallery-thumbnails" id="galleryThumbnails">
                        <!-- Se llenan dinámicamente -->
                    </div>
                    
                    <!-- Información de la propiedad -->
                    <div class="gallery-info" id="galleryInfo">
                        <!-- Se llena dinámicamente -->
                    </div>
                    
                    <!-- Contador de imágenes -->
                    <div class="gallery-counter" id="galleryCounter">
                        <!-- Se llena dinámicamente -->
                    </div>
                </div>
            </div>
        `;

        // Agregar al body
        document.body.insertAdjacentHTML('beforeend', galleryHTML);
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón cerrar
        document.getElementById('galleryClose').addEventListener('click', () => this.close());
        
        // Navegación
        document.getElementById('galleryPrev').addEventListener('click', () => this.previousImage());
        document.getElementById('galleryNext').addEventListener('click', () => this.nextImage());
        
        // Cerrar con overlay click
        document.getElementById('galleryOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'galleryOverlay') {
                this.close();
            }
        });
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            if (e.key === 'ArrowLeft') {
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }

    // Abrir galería para una propiedad
    show(propertyId) {
        const property = PropertyManager.getPropertyById(propertyId);
        if (!property) {
            ConfigUtils.error('Propiedad no encontrada:', propertyId);
            return;
        }

        this.currentProperty = property;
        this.currentImages = PropertyManager.getPropertyImages(property);
        this.currentIndex = 0;
        
        if (this.currentImages.length === 0) {
            ConfigUtils.warn('La propiedad no tiene imágenes disponibles');
            return;
        }

        this.renderGallery();
        this.open();
    }

    // Renderizar la galería
    renderGallery() {
        this.renderMainImage();
        this.renderThumbnails();
        this.renderInfo();
        this.renderCounter();
    }

    // Renderizar imagen principal
    renderMainImage() {
        const mainImage = document.getElementById('galleryMainImage');
        mainImage.src = this.currentImages[this.currentIndex];
        mainImage.alt = this.currentProperty.titulo;
    }

    // Renderizar miniaturas
    renderThumbnails() {
        const thumbnailsContainer = document.getElementById('galleryThumbnails');
        
        thumbnailsContainer.innerHTML = this.currentImages.map((image, index) => `
            <div class="gallery-thumbnail ${index === this.currentIndex ? 'active' : ''}" 
                 onclick="PropertyGallery.goToImage(${index})">
                <img src="${image}" alt="Imagen ${index + 1}" loading="lazy">
            </div>
        `).join('');
    }

    // Renderizar información de la propiedad
    renderInfo() {
        const infoContainer = document.getElementById('galleryInfo');
        const property = this.currentProperty;
        
        infoContainer.innerHTML = `
            <h3>${property.titulo}</h3>
            <div class="gallery-property-details">
                <div class="detail-item">
                    <span>📍</span>
                    <span>${property.barrio}</span>
                </div>
                <div class="detail-item">
                    <span>💰</span>
                    <span>$${property.precio ? property.precio.toLocaleString() : 'Consultar'} ${property.moneda_precio || 'USD'}</span>
                </div>
                <div class="detail-item">
                    <span>🛏️</span>
                    <span>${property.ambientes || 'N/A'} ambientes</span>
                </div>
                <div class="detail-item">
                    <span>📐</span>
                    <span>${property.metros_cuadrados || 'N/A'} m²</span>
                </div>
                <div class="detail-item">
                    <span>🏢</span>
                    <span>${property.tipo ? property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1) : 'N/A'}</span>
                </div>
            </div>
            <div class="gallery-actions">
                <a href="${ConfigUtils.createWhatsAppUrl(`Hola, me interesa obtener más información sobre ${property.titulo}`)}" 
                   class="btn btn-primary" target="_blank">
                    💬 Contactar por WhatsApp
                </a>
                <button class="btn btn-secondary" onclick="PropertyGallery.close()">
                    🔙 Volver
                </button>
            </div>
        `;
    }

    // Renderizar contador
    renderCounter() {
        const counterContainer = document.getElementById('galleryCounter');
        counterContainer.textContent = `${this.currentIndex + 1} de ${this.currentImages.length}`;
    }

    // Ir a imagen específica
    goToImage(index) {
        if (index >= 0 && index < this.currentImages.length) {
            this.currentIndex = index;
            this.renderGallery();
        }
    }

    // Imagen anterior
    previousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderGallery();
        }
    }

    // Siguiente imagen
    nextImage() {
        if (this.currentIndex < this.currentImages.length - 1) {
            this.currentIndex++;
            this.renderGallery();
        }
    }

    // Abrir galería
    open() {
        document.getElementById('galleryOverlay').style.display = 'flex';
        this.isOpen = true;
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }

    // Cerrar galería
    close() {
        document.getElementById('galleryOverlay').style.display = 'none';
        this.isOpen = false;
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
}

// Crear instancia global
window.PropertyGallery = new PropertyGallery();

// Función global para mostrar galería
function showPropertyGallery(propertyId) {
    PropertyGallery.show(propertyId);
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyGallery;
}