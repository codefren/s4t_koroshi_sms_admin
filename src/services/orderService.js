/**
 * Servicio para interactuar con la API de Órdenes
 */

import { API_BASE_URL } from '../config/api'

export const orderService = {
  /**
   * GET /orders/
   * Lista todas las órdenes con paginación y filtros opcionales
   * @param {Object} options - Opciones de paginación y filtros
   * @param {number} options.skip - Número de registros a saltar (default: 0)
   * @param {number} options.limit - Límite de registros (default: 100)
   * @param {string} options.prioridad - Filtro por prioridad (URGENT, HIGH, NORMAL, LOW)
   * @param {string} options.estado_codigo - Filtro por estado (PENDING, ASSIGNED, IN_PICKING, etc.)
   * @param {number} options.almacen_id - Filtro por almacén
   * @param {string} options.fecha_desde - Filtro por fecha desde (formato: YYYY-MM-DD)
   * @param {string} options.fecha_hasta - Filtro por fecha hasta (formato: YYYY-MM-DD)
   * @param {AbortSignal} options.signal - Señal para cancelar la petición
   * @returns {Promise<Array>} Lista de órdenes
   */
  async getAll(options = {}) {
    const { skip = 0, limit = 100, prioridad, estado_codigo, almacen_id, fecha_desde, fecha_hasta, type, signal } = options
    
    // Construir query params
    const params = new URLSearchParams()
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())
    if (prioridad) params.append('prioridad', prioridad)
    if (estado_codigo) params.append('estado_codigo', estado_codigo)
    if (almacen_id) params.append('almacen_id', almacen_id.toString())
    if (fecha_desde) params.append('fecha_desde', fecha_desde)
    if (fecha_hasta) params.append('fecha_hasta', fecha_hasta)
    if (type) params.append('type', type)
    
    const response = await fetch(`${API_BASE_URL}/orders/?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal,
    })

    if (!response.ok) {
      throw new Error(`Error al cargar las órdenes: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * GET /orders/{id}/
   * Obtiene el detalle de una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} Detalle de la orden
   */
  async getById(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Error al cargar el detalle de la orden: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * PUT /orders/{id}/priority
   * Actualiza la prioridad de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} newPriority - Nueva prioridad ('NORMAL', 'HIGH', 'URGENT')
   * @returns {Promise<Object>} Orden actualizada
   */
  async updatePriority(orderId, newPriority) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/priority`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prioridad: newPriority })
    })

    if (!response.ok) {
      throw new Error(`Error al actualizar prioridad: ${response.status}`)
    }

    return response.json()
  },

  /**
   * GET /orders/{order_id}/history
   * Obtiene el historial de eventos de una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Array>} Lista de eventos del historial
   */
  async getHistory(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/history`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Orden no encontrada')
      }
      throw new Error(`Error al cargar historial: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  async assignOperator(orderId, operatorId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign-operator/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator_id: operatorId })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al asignar operario: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

export default orderService
