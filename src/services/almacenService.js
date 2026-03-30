import { API_BASE_URL } from '../config/api'

/**
 * Servicio para interactuar con el API de almacenes
 */
export const almacenService = {
  /**
   * Obtiene todos los almacenes
   * @param {Object} options - Opciones de consulta
   * @param {number} options.skip - Offset para paginación
   * @param {number} options.limit - Límite de resultados
   * @returns {Promise<Array>} Lista de almacenes
   */
  async getAll(options = {}) {
    const { skip = 0, limit = 100 } = options

    const params = new URLSearchParams()
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())

    const response = await fetch(`${API_BASE_URL}/almacenes?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`Error al cargar almacenes: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  },

  /**
   * Obtiene un almacén por ID
   * @param {number} id - ID del almacén
   * @returns {Promise<Object>} Datos del almacén
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/almacenes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`Error al cargar almacén: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  },

  /**
   * Crea un nuevo almacén
   * @param {Object} data - Datos del almacén
   * @param {string} data.descripcion - Descripción del almacén
   * @param {string} data.tipo - Tipo: 'picking', 'reposicion', 'playa'
   * @param {number} [data.pasillos] - Cantidad de pasillos (picking/reposicion)
   * @param {number} [data.ubicaciones_largo] - Ubicaciones a lo largo (picking/reposicion)
   * @param {number} [data.alturas] - Niveles de altura (picking/reposicion)
   * @returns {Promise<Object>} Almacén creado
   */
  async create(data) {
    const response = await fetch(`${API_BASE_URL}/almacenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMsg = `Error al crear almacén: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMsg = errorData.detail || errorData.message || errorMsg
      } catch { /* use default */ }
      throw new Error(errorMsg)
    }

    return await response.json()
  },

  /**
   * Actualiza un almacén existente
   * @param {number} id - ID del almacén
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Almacén actualizado
   */
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/almacenes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMsg = `Error al actualizar almacén: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMsg = errorData.detail || errorData.message || errorMsg
      } catch { /* use default */ }
      throw new Error(errorMsg)
    }

    return await response.json()
  },

  /**
   * Elimina un almacén
   * @param {number} id - ID del almacén
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/almacenes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      let errorMsg = `Error al eliminar almacén: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMsg = errorData.detail || errorData.message || errorMsg
      } catch { /* use default */ }
      throw new Error(errorMsg)
    }

    return true
  },
}

export default almacenService
