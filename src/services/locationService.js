/**
 * Servicio para interactuar con la API de Ubicaciones de Productos
 */

import { API_BASE_URL } from '../config/api'

export const locationService = {
  /**
   * GET /products/{id}/locations
   * Obtiene todas las ubicaciones de un producto
   * @param {number} productId - ID del producto
   * @param {boolean} includeInactive - Incluir ubicaciones inactivas
   * @returns {Promise<Object>} Ubicaciones transformadas para el frontend
   */
  async getLocationsByProduct(productId, includeInactive = false, almacenId) {
    try {
      const params = new URLSearchParams();
      if (almacenId !== undefined && almacenId !== null) {
        params.append('almacen_id', almacenId);
      }
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }
      
      const url = `${API_BASE_URL}/products/${productId}/locations${params.toString() ? '?' + params : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformar datos API → Frontend
      return {
        product_id: data.product_id,
        product_name: data.product_name,
        product_sku: data.product_sku,
        total_locations: data.total_locations,
        total_stock: data.total_stock,
        locations: data.locations.map(loc => {
          const stockMax = 100;
          return {
            id: loc.id,
            locationId: loc.id,
            pasillo: loc.pasillo,
            lado: loc.lado === "IZQUIERDA" ? "Izquierdo" : "Derecho",
            ladoOriginal: loc.lado,
            ubicacion: loc.code,
            ubicacionCode: loc.ubicacion,
            zona: `Pasillo ${loc.pasillo}`,
            altura: `Nivel ${loc.altura}`,
            alturaNumero: loc.altura,
            stockActual: loc.stock_actual,
            stockMax: stockMax,
            stockMin: loc.stock_minimo,
            stockPercent: Math.round((loc.stock_actual / stockMax) * 100),
            stockStatus: loc.stock_actual >= loc.stock_minimo ? "good" : "low",
            prioridad: loc.prioridad,
            activa: loc.activa
          };
        })
      };
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw error;
    }
  },

  /**
   * POST /products/{id}/locations
   * Crea una nueva ubicación para un producto
   * @param {number} productId - ID del producto
   * @param {Object} locationData - Datos de la ubicación
   * @returns {Promise<Object>} Ubicación creada
   */
  async createLocation(productId, locationData) {
    try {
      // Transformar datos Frontend → API
      const apiData = {
        pasillo: locationData.pasillo,
        lado: locationData.lado === "Izquierdo" ? "IZQUIERDA" : "DERECHA",
        ubicacion: locationData.ubicacion,
        altura: typeof locationData.altura === 'string' 
          ? parseInt(locationData.altura.replace("Nivel ", ""))
          : locationData.altura,
        stock_minimo: locationData.stockMinimo || locationData.stock_min || 0,
        stock_actual: locationData.stockActual || locationData.stock_actual || 0,
        prioridad: locationData.prioridad || 3,
        activa: locationData.activa !== false
      };
      
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/locations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(apiData)
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear ubicación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear ubicación:', error);
      throw error;
    }
  },

  /**
   * PUT /products/{product_id}/locations/{location_id}
   * Actualiza una ubicación existente
   * @param {number} productId - ID del producto
   * @param {number} locationId - ID de la ubicación
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object>} Ubicación actualizada
   */
  async updateLocation(productId, locationId, updates) {
    try {
      // Transformar solo los campos que cambiaron (Frontend → API)
      const apiUpdates = {};
      
      if (updates.pasillo !== undefined) apiUpdates.pasillo = updates.pasillo;
      if (updates.lado !== undefined) {
        apiUpdates.lado = updates.lado === "Izquierdo" ? "IZQUIERDA" : "DERECHA";
      }
      if (updates.ubicacion !== undefined) apiUpdates.ubicacion = updates.ubicacion;
      if (updates.altura !== undefined) {
        apiUpdates.altura = typeof updates.altura === 'string'
          ? parseInt(updates.altura.replace("Nivel ", ""))
          : updates.altura;
      }
      if (updates.stockMinimo !== undefined) apiUpdates.stock_minimo = updates.stockMinimo;
      if (updates.stock_min !== undefined) apiUpdates.stock_minimo = updates.stock_min;
      if (updates.stockActual !== undefined) apiUpdates.stock_actual = updates.stockActual;
      if (updates.stock_actual !== undefined) apiUpdates.stock_actual = updates.stock_actual;
      if (updates.prioridad !== undefined) apiUpdates.prioridad = updates.prioridad;
      if (updates.activa !== undefined) apiUpdates.activa = updates.activa;
      
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/locations/${locationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(apiUpdates)
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al actualizar ubicación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
      throw error;
    }
  },

  /**
   * DELETE /products/{product_id}/locations/{location_id}
   * Elimina una ubicación
   * @param {number} productId - ID del producto
   * @param {number} locationId - ID de la ubicación
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteLocation(productId, locationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/locations/${locationId}`,
        {
          method: 'DELETE',
          }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al eliminar ubicación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al eliminar ubicación:', error);
      throw error;
    }
  }
};

export default locationService;
