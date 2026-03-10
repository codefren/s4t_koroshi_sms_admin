/**
 * Servicio para interactuar con la API de Movimientos de Stock
 */

import { API_BASE_URL } from '../config/api'

export const stockMovementService = {
  /**
   * GET /stock-movements
   * Lista todos los movimientos de stock con filtros opcionales
   * @param {Object} options - Parámetros de filtro
   * @returns {Promise<Object>} { total, movimientos, estadisticas }
   */
  async getAll(options = {}) {
    try {
      const params = new URLSearchParams()

      if (options.tipo) params.append('tipo', options.tipo)
      if (options.fecha_desde) params.append('fecha_desde', options.fecha_desde)
      if (options.fecha_hasta) params.append('fecha_hasta', options.fecha_hasta)
      if (options.product_id) params.append('product_id', options.product_id)
      if (options.order_id) params.append('order_id', options.order_id)
      if (options.product_location_id) params.append('product_location_id', options.product_location_id)
      if (options.limit) params.append('limit', options.limit)
      if (options.offset !== undefined) params.append('offset', options.offset)

      const queryString = params.toString()
      const url = `${API_BASE_URL}/stock-movements${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: options.signal,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') throw error
      console.error('Error al obtener movimientos de stock:', error)
      throw error
    }
  },

  /**
   * GET /stock-movements/tipos
   * Lista todos los tipos de movimiento disponibles
   * @returns {Promise<Array<string>>}
   */
  async getTipos() {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-movements/tipos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al obtener tipos de movimiento:', error)
      throw error
    }
  },

  /**
   * GET /stock-movements/stats/summary
   * Obtiene resumen estadístico de movimientos
   * @param {Object} options - { fecha_desde, fecha_hasta }
   * @returns {Promise<Object>}
   */
  async getStatsSummary(options = {}) {
    try {
      const params = new URLSearchParams()

      if (options.fecha_desde) params.append('fecha_desde', options.fecha_desde)
      if (options.fecha_hasta) params.append('fecha_hasta', options.fecha_hasta)

      const queryString = params.toString()
      const url = `${API_BASE_URL}/stock-movements/stats/summary${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al obtener resumen estadístico:', error)
      throw error
    }
  },
}
