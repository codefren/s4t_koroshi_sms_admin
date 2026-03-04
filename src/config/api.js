/**
 * Configuración centralizada de la API
 * Lee la URL base desde variables de entorno de Vite
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * IDs de almacenes del sistema
 * Centralizado aquí para fácil mantenimiento
 */
export const WAREHOUSE_IDS = {
  PICKING: 3,           // Almacén de Picking
  REPLENISHMENT: 4,     // Almacén de Reposición
}

/**
 * Wrapper para fetch con configuración por defecto
 * @param {string} endpoint - Ruta relativa del endpoint (ej: '/orders')
 * @param {Object} options - Opciones adicionales de fetch
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
