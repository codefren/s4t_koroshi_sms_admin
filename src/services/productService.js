/**
 * Servicio para interactuar con la API de Productos
 */

import { API_BASE_URL } from '../config/api'

export const productService = {
  /**
   * GET /products
   * Lista todos los productos con opciones de filtro y búsqueda
   * @param {Object} options - Opciones de filtrado
   * @param {string} options.status - Filtro de estado: 'all', 'active', 'low', 'out'
   * @param {string} options.search - Término de búsqueda (nombre, SKU, categoría)
   * @param {number} options.page - Número de página (default: 1)
   * @param {number} options.perPage - Productos por página (default: 20)
   * @returns {Promise<Object>} Lista paginada de productos
   */
  async getAll(options = {}) {
    try {
      const {
        status = 'all',
        search = '',
        page = 1,
        perPage = 20,
        almacen_id
      } = options;
      
      // Construir query params
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      // Agregar almacen_id si está presente
      if (almacen_id !== undefined && almacen_id !== null) {
        params.append('almacen_id', almacen_id.toString());
      }
      
      // Agregar búsqueda solo si no está vacío
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const url = `${API_BASE_URL}/products?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  /**
   * GET /products/{id}
   * Obtiene el detalle completo de un producto específico
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Datos completos del producto
   */
  async getById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  },

  /**
   * GET /products/{id}/locations
   * Obtiene todas las ubicaciones de un producto (sin límite)
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Todas las ubicaciones del producto
   */
  async getLocations(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/locations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw error;
    }
  },

  /**
   * GET /products/{id}/stock-summary
   * Obtiene un resumen rápido del stock del producto
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Resumen de stock
   */
  async getStockSummary(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/stock-summary`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener resumen de stock:', error);
      throw error;
    }
  }
};

export default productService;
