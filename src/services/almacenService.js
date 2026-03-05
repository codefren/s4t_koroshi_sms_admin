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
}

export default almacenService
