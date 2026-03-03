import { API_BASE_URL } from '../config/api'

/**
 * Servicio para gestionar la distribución de empaquetado de órdenes
 */
const packingService = {
  /**
   * Obtener la distribución de cajas de una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} Datos de distribución de cajas
   */
  async getPackingDistribution(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/packing-distribution`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener distribución de cajas:', error)
      return {
        success: false,
        error: error.message || 'Error al obtener la distribución de cajas'
      }
    }
  },

  /**
   * Cerrar una caja de empaquetado
   * @param {number} boxId - ID de la caja a cerrar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async closeBox(boxId) {
    try {
      const response = await fetch(`${API_BASE_URL}/packing-boxes/${boxId}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al cerrar caja:', error)
      return {
        success: false,
        error: error.message || 'Error al cerrar la caja'
      }
    }
  }
}

export default packingService
