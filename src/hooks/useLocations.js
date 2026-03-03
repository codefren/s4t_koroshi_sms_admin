/**
 * Hook personalizado para gestionar ubicaciones de productos
 * Proporciona funcionalidad CRUD completa con manejo de estado
 */

import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

export const useLocations = (productId, almacenId) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLocations, setTotalLocations] = useState(0);
  const [productInfo, setProductInfo] = useState(null);

  /**
   * Carga las ubicaciones desde la API
   */
  const fetchLocations = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await locationService.getLocationsByProduct(productId, false, almacenId);
      
      setLocations(data.locations);
      setTotalLocations(data.total_locations);
      setProductInfo({
        id: data.product_id,
        name: data.product_name,
        sku: data.product_sku,
        total_stock: data.total_stock
      });
    } catch (err) {
      console.error('Error al cargar ubicaciones:', err);
      setError(err.message);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [productId, almacenId]);

  /**
   * Efecto para cargar ubicaciones cuando cambia el productId
   */
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  /**
   * Añade una nueva ubicación
   * @param {Object} locationData - Datos de la nueva ubicación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const addLocation = async (locationData) => {
    try {
      setLoading(true);
      setError(null);
      
      await locationService.createLocation(productId, locationData);
      
      // Recargar lista después de crear
      await fetchLocations();
      
      return { success: true, message: 'Ubicación creada exitosamente' };
    } catch (err) {
      console.error('Error al crear ubicación:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza una ubicación existente
   * @param {number} locationId - ID de la ubicación
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateLocation = async (locationId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      await locationService.updateLocation(productId, locationId, updates);
      
      // Recargar lista después de actualizar
      await fetchLocations();
      
      return { success: true, message: 'Ubicación actualizada exitosamente' };
    } catch (err) {
      console.error('Error al actualizar ubicación:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una ubicación
   * @param {number} locationId - ID de la ubicación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const removeLocation = async (locationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await locationService.deleteLocation(productId, locationId);
      
      // Recargar lista después de eliminar
      await fetchLocations();
      
      return { success: true, message: 'Ubicación eliminada exitosamente' };
    } catch (err) {
      console.error('Error al eliminar ubicación:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Datos
    locations,
    totalLocations,
    productInfo,
    
    // Estados
    loading,
    error,
    
    // Operaciones CRUD
    addLocation,
    updateLocation,
    removeLocation,
    
    // Utilidades
    refresh: fetchLocations,
    clearError: () => setError(null)
  };
};

export default useLocations;
