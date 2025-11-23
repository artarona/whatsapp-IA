// SISTEMA DINÁMICO PARA CHATBOT - CARGA TODO DESDE PROPIEDADES.JSON
// Todas las imágenes, filtros y configuraciones se generan automáticamente

// Variable global para almacenar las propiedades cargadas dinámicamente
let sistemaPropiedades = {
    propiedades: [],
    tiposDisponibles: [],
    barriosDisponibles: [],
    operacionesDisponibles: [],
    amenidadesDisponibles: [],
    imagenesDisponibles: []
};

// Inicializar el sistema dinámico
async function inicializarSistemaDinamico() {
    console.log('🚀 Inicializando sistema dinámico...');
    
    try {
        // Cargar propiedades desde el archivo JSON
        const response = await fetch('propiedades.json');
        const propiedades = await response.json();
        
        // Almacenar propiedades
        sistemaPropiedades.propiedades = propiedades;
        
        // Generar datos dinámicos
        generarTiposDisponibles();
        generarBarriosDisponibles();
        generarOperacionesDisponibles();
        generarAmenidadesDisponibles();
        generarImagenesDisponibles();
        
        console.log('✅ Sistema dinámico inicializado correctamente');
        console.log(`📊 ${propiedades.length} propiedades cargadas`);
        console.log(`🏷️ ${sistemaPropiedades.tiposDisponibles.length} tipos disponibles`);
        console.log(`📍 ${sistemaPropiedades.barriosDisponibles.length} barrios disponibles`);
        
        return true;
    } catch (error) {
        console.error('❌ Error inicializando sistema dinámico:', error);
        return false;
    }
}

// Generar tipos de propiedades dinámicamente
function generarTiposDisponibles() {
    const tipos = [...new Set(sistemaPropiedades.propiedades.map(p => p.tipo))];
    sistemaPropiedades.tiposDisponibles = tipos.map(tipo => ({
        value: tipo,
        label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        imagenes: getImagenesParaTipo(tipo)
    }));
}

// Generar barrios disponibles dinámicamente
function generarBarriosDisponibles() {
    sistemaPropiedades.barriosDisponibles = [...new Set(
        sistemaPropiedades.propiedades.map(p => p.barrio)
    )].sort();
}

// Generar operaciones disponibles dinámicamente
function generarOperacionesDisponibles() {
    sistemaPropiedades.operacionesDisponibles = [...new Set(
        sistemaPropiedades.propiedades.map(p => p.operacion)
    )];
}

// Generar amenidades disponibles dinámicamente
function generarAmenidadesDisponibles() {
    const amenidades = new Set();
    
    sistemaPropiedades.propiedades.forEach(property => {
        // Recorrer todas las amenidades disponibles
        if (property.pileta === 'Si') amenidades.add('pileta');
        if (property.cochera === 'x') amenidades.add('cochera');
        if (property.balcon === 'x') amenidades.add('balcon');
        if (property.aire_acondicionado === 'Si') amenidades.add('aire_acondicionado');
        if (property.acepta_mascotas === 'Si') amenidades.add('acepta_mascotas');
    });
    
    sistemaPropiedades.amenidadesDisponibles = Array.from(amenidades);
}

// Generar lista de imágenes disponibles
function generarImagenesDisponibles() {
    const imagenes = new Set();
    
    sistemaPropiedades.propiedades.forEach(property => {
        if (property.fotos && Array.isArray(property.fotos)) {
            property.fotos.forEach(foto => imagenes.add(foto));
        }
    });
    
    sistemaPropiedades.imagenesDisponibles = Array.from(imagenes);
}

// Obtener imágenes para un tipo específico dinámicamente
function getImagenesParaTipo(tipo) {
    const propiedadesDelTipo = sistemaPropiedades.propiedades.filter(p => p.tipo === tipo);
    const imagenes = [];
    
    propiedadesDelTipo.forEach(property => {
        if (property.fotos && Array.isArray(property.fotos)) {
            property.fotos.forEach(foto => imagenes.push(foto));
        }
    });
    
    // Si no hay imágenes específicas, usar las imágenes genéricas
    if (imagenes.length === 0) {
        return generarImagenesGenericas(tipo);
    }
    
    return imagenes;
}

// Generar imágenes genéricas para tipos que no tienen imágenes específicas
function generarImagenesGenericas(tipo) {
    const imagenesGenericas = {
        casa: ['imgs/casa_familiar_3.jpg', 'imgs/casa_familiar_6.jpg', 'imgs/casa_familiar_8.jpg'],
        departamento: ['imgs/departamento_palermo_1.jpg', 'imgs/departamento_palermo_4.jpg', 'imgs/departamento_palermo_7.jpg'],
        monoambiente: ['imgs/monoambiente_1.jpg', 'imgs/monoambiente_3.jpg', 'imgs/monoambiente_8.JPEG'],
        apartamento: ['imgs/apartamento_lujo_0.jpg', 'imgs/apartamento_lujo_2.jpg', 'imgs/apartamento_lujo_7.jpg'],
        edificio: ['imgs/edificio_1.jpg', 'imgs/edificio_7.jpg', 'imgs/edificio_8.jpg']
    };
    
    return imagenesGenericas[tipo] || ['imgs/imagen-propiedad.svg'];
}

// Función principal para obtener imagen de propiedad (DINÁMICA)
function obtenerImagenPropiedad(property) {
    // Primera opción: usar las fotos reales de la propiedad
    if (property.fotos && Array.isArray(property.fotos) && property.fotos.length > 0) {
        // Seleccionar imagen basada en el ID para consistencia
        const index = Math.abs(hashCode(property.id_temporal)) % property.fotos.length;
        return property.fotos[index];
    }
    
    // Segunda opción: buscar imágenes del mismo tipo
    const imagenesDelTipo = getImagenesParaTipo(property.tipo);
    if (imagenesDelTipo.length > 0) {
        const index = Math.abs(hashCode(property.id_temporal)) % imagenesDelTipo.length;
        return imagenesDelTipo[index];
    }
    
    // Tercera opción: imagen por defecto
    return 'imgs/imagen-propiedad.svg';
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
                 onerror="this.src='imgs/imagen-propiedad.svg'"
                 loading="lazy">
        </div>
    `;
}

// Función para crear el HTML completo de la tarjeta de propiedad con imagen (DINÁMICA)
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

// Función para llenar dinámicamente los filtros
function llenarFiltrosDinamicos() {
    // Llenar selectores con datos dinámicos
    llenarSelectorBarrios();
    llenarSelectorTipos();
    // Las operaciones ya están predefinidas pero se pueden hacer dinámicas también
}

// Llenar selector de barrios dinámicamente
function llenarSelectorBarrios() {
    const barrioSelect = document.getElementById('barrio-select');
    if (!barrioSelect) return;
    
    // Limpiar opciones existentes excepto la primera
    while (barrioSelect.children.length > 1) {
        barrioSelect.removeChild(barrioSelect.lastChild);
    }
    
    // Agregar opciones dinámicas
    sistemaPropiedades.barriosDisponibles.forEach(barrio => {
        const option = document.createElement('option');
        option.value = barrio;
        option.textContent = barrio;
        barrioSelect.appendChild(option);
    });
}

// Llenar selector de tipos dinámicamente
function llenarSelectorTipos() {
    const tipoSelect = document.getElementById('tipo-select');
    if (!tipoSelect) return;
    
    // Limpiar opciones existentes excepto la primera
    while (tipoSelect.children.length > 1) {
        tipoSelect.removeChild(tipoSelect.lastChild);
    }
    
    // Agregar opciones dinámicas
    sistemaPropiedades.tiposDisponibles.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.value;
        option.textContent = tipo.label;
        tipoSelect.appendChild(option);
    });
}

// Función para obtener propiedades filtradas dinámicamente
function obtenerPropiedadesFiltradas(filtros) {
    return sistemaPropiedades.propiedades.filter(property => {
        // Filtrar por barrio
        if (filtros.barrios.length > 0 && !filtros.barrios.includes(property.barrio)) {
            return false;
        }
        
        // Filtrar por tipo
        if (filtros.tipos.length > 0 && !filtros.tipos.includes(property.tipo)) {
            return false;
        }
        
        // Filtrar por operación
        if (filtros.operaciones.length > 0 && !filtros.operaciones.includes(property.operacion)) {
            return false;
        }
        
        // Filtrar por precio
        if (filtros.precio_min && property.precio < filtros.precio_min) {
            return false;
        }
        if (filtros.precio_max && property.precio > filtros.precio_max) {
            return false;
        }
        
        // Filtrar por ambientes
        if (filtros.ambientes_min && property.ambientes < filtros.ambientes_min) {
            return false;
        }
        
        return true;
    });
}

// Exportar funciones para uso global
window.obtenerImagenPropiedad = obtenerImagenPropiedad;
window.crearImagenPropiedadHTML = crearImagenPropiedadHTML;
window.crearTarjetaPropiedad = crearTarjetaPropiedad;
window.llenarFiltrosDinamicos = llenarFiltrosDinamicos;
window.obtenerPropiedadesFiltradas = obtenerPropiedadesFiltradas;
window.sistemaPropiedades = sistemaPropiedades;

// Inicializar cuando el DOM esté listo
function inicializarSiEsPosible() {
    if (typeof inicializarSistemaDinamico === 'function') {
        inicializarSistemaDinamico();
    } else {
        console.log('⏳ Esperando carga de funciones del sistema...');
        setTimeout(inicializarSiEsPosible, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSiEsPosible);
} else {
    inicializarSiEsPosible();
}