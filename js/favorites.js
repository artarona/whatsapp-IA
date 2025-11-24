// ===== SISTEMA DE FAVORITOS =====

class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
        this.storageKey = 'dante-propiedades-favoritos';
        
        ConfigUtils.info('Sistema de favoritos inicializado');
    }

    // Cargar favoritos desde localStorage
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            ConfigUtils.error('Error cargando favoritos:', error);
            return [];
        }
    }

    // Guardar favoritos en localStorage
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            ConfigUtils.debug('Favoritos guardados:', this.favorites);
        } catch (error) {
            ConfigUtils.error('Error guardando favoritos:', error);
        }
    }

    // Agregar propiedad a favoritos
    addFavorite(propertyId) {
        if (!this.favorites.includes(propertyId)) {
            this.favorites.push(propertyId);
            this.saveFavorites();
            this.updateFavoriteButtons(propertyId, true);
            this.showNotification('❤️ Propiedad agregada a favoritos', 'success');
            
            ConfigUtils.info('Propiedad agregada a favoritos:', propertyId);
            return true;
        }
        return false;
    }

    // Remover propiedad de favoritos
    removeFavorite(propertyId) {
        const index = this.favorites.indexOf(propertyId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.updateFavoriteButtons(propertyId, false);
            this.showNotification('💔 Propiedad removida de favoritos', 'info');
            
            ConfigUtils.info('Propiedad removida de favoritos:', propertyId);
            return true;
        }
        return false;
    }

    // Alternar favoritos
    toggleFavorite(propertyId) {
        if (this.isFavorite(propertyId)) {
            return this.removeFavorite(propertyId);
        } else {
            return this.addFavorite(propertyId);
        }
    }

    // Verificar si es favorito
    isFavorite(propertyId) {
        return this.favorites.includes(propertyId);
    }

    // Obtener todos los favoritos
    getFavorites() {
        return [...this.favorites];
    }

    // Obtener propiedades favoritas completas
    getFavoriteProperties() {
        return this.favorites.map(id => PropertyManager.getPropertyById(id))
            .filter(property => property !== undefined);
    }

    // Actualizar botones de favoritos
    updateFavoriteButtons(propertyId, isFavorite) {
        const buttons = document.querySelectorAll(`[onclick*="${propertyId}"]`);
        buttons.forEach(button => {
            if (button.innerHTML.includes('❤️') || button.innerHTML.includes('Guardar')) {
                button.innerHTML = isFavorite ? '💔 Quitar Favorito' : '❤️ Guardar';
                button.className = isFavorite ? 
                    'btn btn-secondary' : 
                    'btn btn-secondary';
            }
        });

        // También actualizar botones específicos de favoritos
        const favoriteButtons = document.querySelectorAll(`[onclick="saveToFavorites('${propertyId}')"]`);
        favoriteButtons.forEach(button => {
            button.innerHTML = isFavorite ? '💔 Quitar Favorito' : '❤️ Guardar';
        });
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: '10000',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out'
        });

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Limpiar todos los favoritos
    clearAllFavorites() {
        this.favorites = [];
        this.saveFavorites();
        
        // Actualizar todos los botones
        document.querySelectorAll('[onclick*="saveToFavorites"]').forEach(button => {
            button.innerHTML = '❤️ Guardar';
        });
        
        this.showNotification('🗑️ Todos los favoritos han sido eliminados', 'info');
        ConfigUtils.info('Todos los favoritos han sido eliminados');
    }

    // Exportar favoritos
    exportFavorites() {
        const favorites = this.getFavoriteProperties();
        const data = {
            exportDate: new Date().toISOString(),
            totalProperties: favorites.length,
            properties: favorites
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dante-propiedades-favoritos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('📁 Favoritos exportados correctamente', 'success');
    }

    // Obtener estadísticas de favoritos
    getFavoritesStats() {
        const favorites = this.getFavoriteProperties();
        return {
            total: favorites.length,
            byType: this.groupByType(favorites),
            byNeighborhood: this.groupByNeighborhood(favorites),
            byOperation: this.groupByOperation(favorites),
            averagePrice: this.calculateAveragePrice(favorites)
        };
    }

    // Agrupar por tipo
    groupByType(properties) {
        return properties.reduce((acc, property) => {
            const type = property.tipo || 'Sin tipo';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
    }

    // Agrupar por barrio
    groupByNeighborhood(properties) {
        return properties.reduce((acc, property) => {
            const neighborhood = property.barrio || 'Sin barrio';
            acc[neighborhood] = (acc[neighborhood] || 0) + 1;
            return acc;
        }, {});
    }

    // Agrupar por operación
    groupByOperation(properties) {
        return properties.reduce((acc, property) => {
            const operation = property.operacion || 'Sin operación';
            acc[operation] = (acc[operation] || 0) + 1;
            return acc;
        }, {});
    }

    // Calcular precio promedio
    calculateAveragePrice(properties) {
        const propertiesWithPrice = properties.filter(p => p.precio && p.precio > 0);
        if (propertiesWithPrice.length === 0) return 0;
        
        const total = propertiesWithPrice.reduce((sum, p) => sum + p.precio, 0);
        return Math.round(total / propertiesWithPrice.length);
    }
}

// Crear instancia global
window.FavoritesManager = new FavoritesManager();

// Funciones globales para usar desde HTML
function saveToFavorites(propertyId) {
    return FavoritesManager.toggleFavorite(propertyId);
}

function isPropertyFavorite(propertyId) {
    return FavoritesManager.isFavorite(propertyId);
}

function getFavoriteProperties() {
    return FavoritesManager.getFavoriteProperties();
}

function exportFavorites() {
    FavoritesManager.exportFavorites();
}

function clearAllFavorites() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
        FavoritesManager.clearAllFavorites();
    }
}

// Mostrar modal de favoritos (se puede implementar después)
function showFavoritesModal() {
    const favorites = FavoritesManager.getFavoriteProperties();
    
    if (favorites.length === 0) {
        alert('No tienes propiedades en favoritos aún.');
        return;
    }
    
    // Aquí se puede implementar un modal para mostrar favoritos
    console.log('Favoritos:', favorites);
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesManager;
}