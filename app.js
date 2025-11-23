// SISTEMA DE IMÁGENES INTELIGENTE PARA CHATBOT
// Asigna automáticamente imágenes según el tipo de propiedad

function obtenerImagenPropiedad(property) {
    const imageMapping = {
        // Casas
        casa: [
            'imgs/casa_familiar_3.jpg',
            'imgs/casa_familiar_6.jpg', 
            'imgs/casa_familiar_8.jpg'
        ],
        // Departamentos
        departamento: [
            'imgs/departamento_palermo_1.jpg',
            'imgs/departamento_palermo_4.jpg',
            'imgs/departamento_palermo_7.jpg'
        ],
        // Monoambientes
        monoambiente: [
            'imgs/monoambiente_1.jpg',
            'imgs/monoambiente_3.jpg',
            'imgs/monoambiente_8.JPEG'
        ],
        // Apartamentos de lujo
        apartamento: [
            'imgs/apartamento_lujo_0.jpg',
            'imgs/apartamento_lujo_2.jpg',
            'imgs/apartamento_lujo_7.jpg'
        ],
        // Edificios
        edificio: [
            'imgs/edificio_1.jpg',
            'imgs/edificio_7.jpg',
            'imgs/edificio_8.jpg'
        ]
    };
    
    // Obtener imágenes según el tipo de propiedad
    const tipo = property.tipo ? property.tipo.toLowerCase() : '';
    const imagenes = imageMapping[tipo] || imageMapping['departamento']; // Default a departamentos
    
    // Seleccionar imagen basada en el ID para consistencia
    const index = Math.abs(hashCode(property.id_temporal)) % imagenes.length;
    let imagenPrincipal = imagenes[index];
    
    // Verificar si la imagen existe
    return verificarImagen(imagenPrincipal) ? imagenPrincipal : 'imgs/imagen-propiedad.svg';
}

// Función para verificar si una imagen existe
function verificarImagen(src) {
    // En un entorno real, esto haría una petición HTTP
    // Por simplicidad, asumimos que las imágenes existen
    return true;
}

// Función hash simple para obtener un número consistente
function hashCode(str) {
    let hash = 0;
    if (str.length == 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

// Función para crear el HTML de la imagen de propiedad
function crearImagenPropiedadHTML(property) {
    const imagenSrc = obtenerImagenPropiedad(property);
    
    return `
        <div class="property-image">
            <img src="${imagenSrc}" 
                 alt="${property.titulo}" 
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;"
                 onerror="this.src='imgs/imagen-propiedad.svg'">
        </div>
    `;
}

// Función para crear el HTML completo de la tarjeta de propiedad con imagen
function crearTarjetaPropiedad(property) {
    return `
        <div class="property-card">
            ${crearImagenPropiedadHTML(property)}
            <h3>${property.titulo}</h3>
            <div class="property-info">
                <div class="info-item">
                    <span>📍</span>
                    <span><strong>Ubicación:</strong> ${property.barrio}</span>
                </div>
                <div class="info-item">
                    <span>💰</span>
                    <span><strong>Precio:</strong> $${property.precio.toLocaleString()} ${property.moneda_precio}</span>
                </div>
                <div class="info-item">
                    <span>🛏️</span>
                    <span><strong>Ambientes:</strong> ${property.ambientes}</span>
                </div>
                <div class="info-item">
                    <span>📐</span>
                    <span><strong>Superficie:</strong> ${property.metros_cuadrados} m²</span>
                </div>
                <div class="info-item">
                    <span>🏢</span>
                    <span><strong>Tipo:</strong> ${property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1)}</span>
                </div>
                <div class="info-item">
                    <span>💰</span>
                    <span><strong>Operación:</strong> ${property.operacion.charAt(0).toUpperCase() + property.operacion.slice(1)}</span>
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
                <a href="#" class="btn btn-primary" onclick="showPropertyDetails('${property.id_temporal}')">
                    📸 Ver Fotos
                </a>
                <a href="formulario.html" class="btn btn-secondary">
                    💬 Contactar
                </a>
                <a href="#" class="btn btn-secondary" onclick="saveToFavorites('${property.id_temporal}')">
                    ❤️ Guardar
                </a>
            </div>
        </div>
    `;
}