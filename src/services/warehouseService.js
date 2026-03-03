/**
 * Servicio para interactuar con la API de Ubicaciones del Almacén
 */

import { API_BASE_URL } from '../config/api'

export const warehouseService = {
  /**
   * GET /api/v1/locations?almacen_id={id}
   * Obtiene todas las ubicaciones de un almacén
   * @param {number} almacenId - ID del almacén
   * @param {boolean} includeInactive - Incluir ubicaciones inactivas
   * @returns {Promise<Object>} Ubicaciones del almacén
   */
  async getAllLocations(almacenId = 1, includeInactive = false) {
    // TEMPORAL: Usar mock data directamente hasta que el backend esté listo
    // TODO: Descomentar la llamada real cuando el backend funcione
    console.warn('⚠️ Usando datos mock - El endpoint de backend aún no está disponible')
    return this.getMockLocations(almacenId, includeInactive)

    /* DESCOMENTAR CUANDO EL BACKEND FUNCIONE:
    try {
      const params = new URLSearchParams({
        almacen_id: almacenId.toString()
      })
      
      if (includeInactive) {
        params.append('include_inactive', 'true')
      }
      
      const url = `${API_BASE_URL}/locations?${params}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        console.warn(`API returned ${response.status}, using mock data for development`)
        return this.getMockLocations(almacenId, includeInactive)
      }
      
      const data = await response.json()
      
      // Transformar datos API → Frontend
      return {
        almacen_id: data.almacen_id || almacenId,
        total_locations: data.total_locations || data.locations?.length || 0,
        locations: (data.locations || []).map(loc => ({
          id: loc.id,
          pasillo: loc.pasillo,
          lado: loc.lado,
          altura: loc.altura,
          code: loc.code || loc.ubicacion,
          stock_actual: loc.stock_actual || 0,
          stock_minimo: loc.stock_minimo || 0,
          product_id: loc.product_id || null,
          product_name: loc.product_name || null,
          product_sku: loc.product_sku || null,
          activa: loc.activa !== false,
          prioridad: loc.prioridad || 3
        }))
      }
    } catch (error) {
      console.error('Error al obtener ubicaciones del almacén:', error)
      console.warn('Using mock data for development')
      return this.getMockLocations(almacenId, includeInactive)
    }
    */
  },

  getMockLocations(almacenId = 1, includeInactive = false) {
    const mockData = []
    let id = 1

    const pasillos = ['A', 'B', 'C']
    const lados = ['IZQUIERDA', 'DERECHA']
    const productos = [
      { id: 101, name: 'Producto Alpha', sku: 'SKU-ALPHA-001' },
      { id: 102, name: 'Producto Beta', sku: 'SKU-BETA-002' },
      { id: 103, name: 'Producto Gamma', sku: 'SKU-GAMMA-003' },
      { id: 104, name: 'Producto Delta', sku: 'SKU-DELTA-004' },
      { id: 105, name: 'Producto Epsilon', sku: 'SKU-EPSI-005' },
    ]

    pasillos.forEach(pasillo => {
      lados.forEach(lado => {
        for (let altura = 1; altura <= 5; altura++) {
          const numLocations = Math.floor(Math.random() * 3) + 1
          
          for (let i = 0; i < numLocations; i++) {
            const hasProduct = Math.random() > 0.3
            const product = hasProduct ? productos[Math.floor(Math.random() * productos.length)] : null
            const stockActual = hasProduct ? Math.floor(Math.random() * 100) : 0
            const stockMinimo = hasProduct ? Math.floor(Math.random() * 30) + 10 : 0
            const activa = Math.random() > 0.1
            
            const location = {
              id: id++,
              pasillo: pasillo,
              lado: lado,
              altura: altura,
              code: `${pasillo}-${lado.substring(0, 3)}-${altura}-${String(i + 1).padStart(3, '0')}`,
              stock_actual: stockActual,
              stock_minimo: stockMinimo,
              product_id: product?.id || null,
              product_name: product?.name || null,
              product_sku: product?.sku || null,
              activa: activa,
              prioridad: Math.floor(Math.random() * 5) + 1
            }

            if (includeInactive || activa) {
              mockData.push(location)
            }
          }
        }
      })
    })

    return {
      almacen_id: almacenId,
      total_locations: mockData.length,
      locations: mockData
    }
  },

  /**
   * Agrupa ubicaciones por estructura de almacén
   * @param {Array} locations - Array de ubicaciones
   * @returns {Object} Ubicaciones agrupadas por pasillo/lado/altura
   */
  groupLocationsByStructure(locations) {
    const grouped = {}
    
    locations.forEach(location => {
      const { pasillo, lado, altura } = location
      
      if (!grouped[pasillo]) {
        grouped[pasillo] = {
          IZQUIERDA: {},
          DERECHA: {}
        }
      }
      
      if (!grouped[pasillo][lado]) {
        grouped[pasillo][lado] = {}
      }
      
      if (!grouped[pasillo][lado][altura]) {
        grouped[pasillo][lado][altura] = []
      }
      
      grouped[pasillo][lado][altura].push(location)
    })
    
    return grouped
  },

  /**
   * Calcula estadísticas de las ubicaciones
   * @param {Array} locations - Array de ubicaciones
   * @returns {Object} Estadísticas
   */
  calculateStats(locations) {
    const stats = {
      total: locations.length,
      ocupadas: 0,
      vacias: 0,
      stockBajo: 0,
      inactivas: 0,
      stockOptimo: 0
    }
    
    locations.forEach(loc => {
      if (!loc.activa) {
        stats.inactivas++
      } else if (loc.stock_actual === 0) {
        stats.vacias++
      } else if (loc.stock_actual < loc.stock_minimo) {
        stats.stockBajo++
      } else {
        stats.stockOptimo++
      }
      
      if (loc.product_id) {
        stats.ocupadas++
      }
    })
    
    return stats
  },

  /**
   * Obtiene el estado de stock de una ubicación
   * @param {Object} location - Ubicación
   * @returns {string} Estado: 'optimal', 'low', 'empty', 'inactive'
   */
  getStockStatus(location) {
    if (!location.activa) return 'inactive'
    if (location.stock_actual === 0) return 'empty'
    if (location.stock_actual < location.stock_minimo) return 'low'
    return 'optimal'
  },

  /**
   * Obtiene el color según el estado de stock
   * @param {string} status - Estado de stock
   * @returns {string} Color hexadecimal
   */
  getStatusColor(status) {
    const colors = {
      optimal: '#10B981',  // Verde
      low: '#F59E0B',      // Amarillo
      empty: '#EF4444',    // Rojo
      inactive: '#94A3B8'  // Gris
    }
    return colors[status] || colors.inactive
  }
}
