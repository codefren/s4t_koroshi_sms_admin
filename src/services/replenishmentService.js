/**
 * Servicio para interactuar con la API de Solicitudes de Reposición
 * Base URL: http://localhost:8000/api/v1
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const replenishmentService = {
  /**
   * GET /replenishment/requests
   * Lista todas las solicitudes de reposición con filtros
   * @param {Object} options - Opciones de filtrado
   * @param {string} options.status - Filtro de estado: 'READY', 'WAITING_STOCK', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'
   * @param {string} options.priority - Filtro de prioridad: 'URGENT', 'HIGH', 'NORMAL'
   * @param {number} options.almacen_id - ID del almacén
   * @param {number} options.product_id - ID del producto
   * @param {number} options.page - Número de página (default: 1)
   * @param {number} options.perPage - Items por página (default: 20)
   * @returns {Promise<Object>} Lista paginada de solicitudes
   */
  async getAll(options = {}) {
    try {
      const {
        status,
        priority,
        almacen_id,
        product_id,
        page = 1,
        perPage = 20
      } = options;
      
      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      // Agregar filtros opcionales
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (almacen_id) params.append('almacen_id', almacen_id.toString());
      if (product_id) params.append('product_id', product_id.toString());
      
      const url = `${API_BASE_URL}/replenishment/requests?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener solicitudes de reposición:', error);
      throw error;
    }
  },

  /**
   * GET /replenishment/requests/{id}
   * Obtiene el detalle completo de una solicitud específica
   * @param {number} requestId - ID de la solicitud
   * @returns {Promise<Object>} Datos completos de la solicitud
   */
  async getById(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/replenishment/requests/${requestId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Solicitud de reposición no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error);
      throw error;
    }
  },

  /**
   * POST /replenishment/requests/{id}/start
   * Inicia la ejecución de una solicitud
   * @param {number} requestId - ID de la solicitud
   * @param {number} executorId - ID del operador que ejecutará
   * @returns {Promise<Object>} Respuesta de la acción
   */
  async start(requestId, executorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/replenishment/requests/${requestId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ executor_id: executorId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al iniciar solicitud:', error);
      throw error;
    }
  },

  /**
   * POST /replenishment/requests/{id}/complete
   * Completa una solicitud y actualiza stock automáticamente
   * @param {number} requestId - ID de la solicitud
   * @returns {Promise<Object>} Respuesta de la acción
   */
  async complete(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/replenishment/requests/${requestId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al completar solicitud:', error);
      throw error;
    }
  },

  /**
   * POST /replenishment/requests/{id}/reject
   * Rechaza una solicitud
   * @param {number} requestId - ID de la solicitud
   * @param {string} notes - Motivo del rechazo
   * @returns {Promise<Object>} Respuesta de la acción
   */
  async reject(requestId, notes = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/replenishment/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw error;
    }
  }
};

export default replenishmentService;
