/**
 * Servicio para interactuar con la API de Órdenes
 */

import { API_BASE_URL } from '../config/api'

export const orderService = {
  /**
   * GET /orders/
   * Lista todas las órdenes
   * @returns {Promise<Array>} Lista de órdenes
   */
  async getAll(signal) {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
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
   * PUT /orders/{id}/assign-operator/
   * Asigna un operario a una orden
   * @param {number} orderId - ID de la orden
   * @param {number} operatorId - ID del operario
   * @returns {Promise<Object>} Orden actualizada
   */
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
