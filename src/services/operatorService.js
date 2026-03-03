/**
 * Servicio para interactuar con la API de Operarios
 */

import { API_BASE_URL } from '../config/api'

export const operatorService = {
  /**
   * GET /operators
   * Lista todos los operarios con opción de filtrar por estado activo
   * @param {boolean|null} activo - true para activos, false para inactivos, null para todos
   * @returns {Promise<Array>} Lista de operarios
   */
  async getAll(activo = null) {
    try {
      const url = activo !== null 
        ? `${API_BASE_URL}/operators?activo=${activo}`
        : `${API_BASE_URL}/operators`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener operarios:', error);
      throw error;
    }
  },

  /**
   * GET /operators/{id}
   * Obtiene el detalle de un operario específico
   * @param {number} operatorId - ID del operario
   * @returns {Promise<Object>} Datos del operario
   */
  async getById(operatorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/operators/${operatorId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Operario no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener operario:', error);
      throw error;
    }
  },

  /**
   * POST /operators
   * Crea un nuevo operario
   * @param {Object} operatorData - Datos del operario a crear
   * @returns {Promise<Object>} - Operario creado
   */
  async create(operatorData) {
    const response = await fetch(`${API_BASE_URL}/operators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operatorData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear operario');
    }
    
    return await response.json();
  },

  /**
   * PUT /operators/{id}
   * Actualiza un operario existente
   * NOTA: El endpoint NO permite cambiar codigo_operario
   * @param {number} operatorId - ID del operario
   * @param {Object} operatorData - Datos a actualizar (nombre, activo)
   * @returns {Promise<Object>} - Operario actualizado
   */
  async update(operatorId, operatorData) {
    const response = await fetch(`${API_BASE_URL}/operators/${operatorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operatorData),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Operario con ID ${operatorId} no encontrado`);
      }
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar operario');
    }
    
    return await response.json();
  },

  /**
   * PATCH /operators/{id}/toggle-status
   * Activa o desactiva un operario
   * @param {number} operatorId - ID del operario
   * @param {boolean} activo - Nuevo estado (true = activo, false = inactivo)
   * @param {string} razon - Razón del cambio (opcional)
   * @returns {Promise<Object>} - Operario actualizado
   */
  async toggleStatus(operatorId, activo, razon = null) {
    const body = { activo };
    if (razon) {
      body.razon = razon;
    }
    
    const response = await fetch(`${API_BASE_URL}/operators/${operatorId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Operario con ID ${operatorId} no encontrado`);
      }
      const error = await response.json();
      throw new Error(error.detail || 'Error al cambiar estado del operario');
    }
    
    return await response.json();
  }
};
