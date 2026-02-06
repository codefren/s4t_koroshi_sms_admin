/**
 * Utilidades para transformar datos de productos entre API y UI
 */

/**
 * Transforma los datos de productos de la API al formato de la UI
 * La API ya devuelve los datos en el formato correcto, pero esta función
 * asegura compatibilidad y puede agregar campos calculados si es necesario
 * @param {Array} products - Lista de productos de la API
 * @returns {Array} Productos transformados para la UI
 */
export const transformProductListData = (products) => {
  if (!Array.isArray(products)) {
    console.warn('transformProductListData: Se esperaba un array, se recibió:', typeof products);
    return [];
  }

  return products.map(product => ({
    id: product.id,
    name: product.name || 'Sin nombre',
    category: product.category || 'Sin categoría',
    sku: product.sku || 'N/A',
    talla: product.talla || 'N/A',
    image: product.image || null,
    locations: Array.isArray(product.locations) ? product.locations : [],
    stock: product.stock || 0,
    status: product.status || 'Sin Stock',
    statusClass: product.statusClass || 'out-of-stock',
    // Guardar datos originales por si se necesitan
    _raw: product
  }));
};

/**
 * Transforma un producto individual de la API
 * @param {Object} product - Producto de la API
 * @returns {Object} Producto transformado
 */
export const transformProductData = (product) => {
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name || 'Sin nombre',
    category: product.category || 'Sin categoría',
    sku: product.sku || 'N/A',
    talla: product.talla || 'N/A',
    image: product.image || null,
    locations: Array.isArray(product.locations) ? product.locations : [],
    stock: product.stock || 0,
    status: product.status || 'Sin Stock',
    statusClass: product.statusClass || 'out-of-stock',
    _raw: product
  };
};

/**
 * Calcula el ancho de la barra de stock como porcentaje
 * @param {number} stock - Cantidad de stock
 * @param {number} maxStock - Stock máximo para calcular el 100% (default: 250)
 * @returns {number} Porcentaje entre 0-100
 */
export const calculateStockBarWidth = (stock, maxStock = 250) => {
  if (!stock || stock <= 0) return 0;
  const percentage = (stock / maxStock) * 100;
  return Math.min(percentage, 100);
};

/**
 * Obtiene el color de la barra de stock según la cantidad
 * @param {number} stock - Cantidad de stock
 * @returns {string} CSS gradient string
 */
export const getStockBarColor = (stock) => {
  if (stock === 0) {
    return 'linear-gradient(315deg, #E74C3C 64.64%, #C0392B 135.36%)'; // Rojo
  }
  if (stock < 50) {
    return 'linear-gradient(315deg, #F39C12 64.64%, #E67E22 135.36%)'; // Amarillo
  }
  return 'linear-gradient(315deg, #2ECC71 64.64%, #27AE60 135.36%)'; // Verde
};

/**
 * Formatea las ubicaciones para mostrar
 * Si hay más de 2 ubicaciones, muestra las primeras 2 y un indicador "+X más"
 * @param {Array} locations - Array de ubicaciones
 * @param {number} maxVisible - Número máximo de ubicaciones visibles (default: 2)
 * @returns {Array} Array de ubicaciones formateado
 */
export const formatLocationsForDisplay = (locations, maxVisible = 2) => {
  if (!Array.isArray(locations) || locations.length === 0) {
    return [];
  }

  // Si hay menos o igual al máximo, retornar todas
  if (locations.length <= maxVisible) {
    return locations.map(loc => ({
      code: loc.code,
      isMore: false,
      stock: loc.stock
    }));
  }

  // Si hay más, mostrar las primeras y agregar indicador
  const visible = locations.slice(0, maxVisible);
  const remaining = locations.length - maxVisible;
  
  return [
    ...visible.map(loc => ({
      code: loc.code,
      isMore: false,
      stock: loc.stock
    })),
    {
      code: `+${remaining} más`,
      isMore: true
    }
  ];
};

/**
 * Valida si una búsqueda tiene texto válido
 * @param {string} searchTerm - Término de búsqueda
 * @returns {boolean} true si es válido
 */
export const isValidSearchTerm = (searchTerm) => {
  return searchTerm && 
         typeof searchTerm === 'string' && 
         searchTerm.trim().length >= 2;
};

/**
 * Obtiene el texto del filtro para mostrar en la UI
 * @param {string} filterKey - Clave del filtro ('all', 'active', 'low', 'out')
 * @returns {string} Texto descriptivo del filtro
 */
export const getFilterText = (filterKey) => {
  const filters = {
    'all': 'Todos los productos',
    'active': 'Productos activos',
    'low': 'Stock bajo',
    'out': 'Sin stock'
  };
  
  return filters[filterKey] || 'Todos';
};

/**
 * Obtiene estadísticas de una lista de productos
 * @param {Array} products - Lista de productos
 * @returns {Object} Estadísticas calculadas
 */
export const calculateProductStats = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      total: 0,
      active: 0,
      lowStock: 0,
      outOfStock: 0,
      totalStock: 0
    };
  }

  return products.reduce((stats, product) => {
    stats.total++;
    stats.totalStock += product.stock || 0;
    
    if (product.statusClass === 'active') {
      stats.active++;
    } else if (product.statusClass === 'low-stock') {
      stats.lowStock++;
    } else if (product.statusClass === 'out-of-stock') {
      stats.outOfStock++;
    }
    
    return stats;
  }, {
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    totalStock: 0
  });
};

/**
 * Verifica si un producto necesita reposición
 * @param {Object} product - Producto a verificar
 * @param {number} threshold - Umbral de stock bajo (default: 50)
 * @returns {boolean} true si necesita reposición
 */
export const needsRestock = (product, threshold = 50) => {
  return product && product.stock < threshold;
};
