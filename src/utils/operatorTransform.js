/**
 * Utilidades para transformar datos de operarios
 * Convierte el formato de la API al formato esperado por la UI
 */

/**
 * Transforma un operario de la API al formato de la UI
 * @param {Object} apiOperator - Operario en formato API
 * @returns {Object} Operario en formato UI
 */
export function transformOperatorData(apiOperator) {
  const createdDate = new Date(apiOperator.created_at);
  const now = new Date();
  const diffMs = now - createdDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  
  let registeredTime;
  if (diffDays < 1) {
    registeredTime = 'Hoy';
  } else if (diffDays < 30) {
    registeredTime = `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } else if (diffMonths < 12) {
    registeredTime = `${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
  } else {
    const diffYears = Math.floor(diffMonths / 12);
    registeredTime = `${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
  }
  
  return {
    id: apiOperator.id,
    code: apiOperator.codigo_operario,
    name: apiOperator.nombre,
    registeredTime,
    status: apiOperator.activo ? 'Activo' : 'Inactivo',
    statusClass: apiOperator.activo ? 'active' : 'inactive',
    // Guardar datos originales para referencia
    _raw: apiOperator
  };
}

/**
 * Transforma una lista de operarios de la API al formato de la UI
 * @param {Array} apiOperators - Lista de operarios en formato API
 * @returns {Array} Lista de operarios en formato UI
 */
export function transformOperatorListData(apiOperators) {
  if (!Array.isArray(apiOperators)) {
    return [];
  }
  return apiOperators.map(transformOperatorData);
}

/**
 * Transforma datos del formulario UI al formato esperado por la API
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos en formato API
 */
export function transformToApiFormat(formData) {
  return {
    codigo_operario: formData.codigo_operario,
    nombre: formData.nombre,
    activo: formData.activo !== undefined ? formData.activo : true
  };
}

/**
 * Valida el formato del código de operario
 * @param {string} code - Código a validar
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateOperatorCode(code) {
  if (!code || code.trim() === '') {
    return { valid: false, error: 'El código de operario es requerido' };
  }
  
  if (code.length > 50) {
    return { valid: false, error: 'El código no puede exceder 50 caracteres' };
  }
  
  // Formato recomendado: OP seguido de números (ej: OP001, OP002)
  const recommendedFormat = /^OP\d{3,}$/;
  if (!recommendedFormat.test(code)) {
    return { 
      valid: true, 
      warning: 'Formato recomendado: OP seguido de números (ej: OP001)' 
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Valida el nombre del operario
 * @param {string} name - Nombre a validar
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateOperatorName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'El nombre del operario es requerido' };
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }
  
  if (name.trim().length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  
  return { valid: true, error: null };
}
