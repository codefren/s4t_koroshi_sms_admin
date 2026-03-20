import { useState, useEffect } from 'react'
import './PackingDistribution.css'
import packingService from './services/packingService'

function PackingDistribution({ orderId, onBack, showConfirmButton = false, onConfirmBoxes }) {
  const [distribution, setDistribution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [closingBox, setClosingBox] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchDistribution()
  }, [orderId])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const fetchDistribution = async () => {
    if (!orderId) {
      setError('No se proporcionó ID de orden')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await packingService.getPackingDistribution(orderId)

    if (result.success) {
      setDistribution(result.data)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleCloseBox = async (boxId, boxCode) => {
    if (!window.confirm(`¿Está seguro de cerrar la caja ${boxCode}?`)) {
      return
    }

    setClosingBox(boxId)
    const result = await packingService.closeBox(boxId)

    if (result.success) {
      setSuccessMessage(`Caja ${boxCode} cerrada exitosamente`)
      await fetchDistribution()
    } else {
      setError(result.error)
    }

    setClosingBox(null)
  }

  const getEstadoBadgeClass = (estado) => {
    const classes = {
      'OPEN': 'packing-estado-badge-open',
      'CLOSED': 'packing-estado-badge-closed',
      'IN_PICKING': 'packing-estado-badge-picking',
      'PACKING': 'packing-estado-badge-packing'
    }
    return classes[estado] || 'packing-estado-badge-default'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      'OPEN': 'ABIERTA',
      'CLOSED': 'CERRADA',
      'IN_PICKING': 'EN PICKING',
      'PACKING': 'EMPAQUETANDO'
    }
    return labels[estado] || estado
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="packing-distribution-container">
        <div className="packing-loading-state">
          <div className="packing-spinner"></div>
          <p>Cargando distribución de cajas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="packing-distribution-container">
        <div className="packing-error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EF4444"/>
          </svg>
          <h3>Error al cargar distribución</h3>
          <p>{error}</p>
          <button className="packing-retry-button" onClick={fetchDistribution}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!distribution) {
    return (
      <div className="packing-distribution-container">
        <div className="packing-empty-state">
          <p>No hay datos de distribución</p>
        </div>
      </div>
    )
  }

  const { order, cajas, resumen } = distribution

  return (
    <div className="packing-distribution-container">
      {successMessage && (
        <div className="packing-success-message">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#2ECC71"/>
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="packing-header">
        <div className="packing-header-left">
          {onBack && (
            <button className="packing-back-button" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21.375 11.9991C21.375 12.2974 21.2565 12.5836 21.0455 12.7946C20.8345 13.0055 20.5484 13.1241 20.25 13.1241H6.46878L11.2988 17.9531C11.5101 18.1645 11.6289 18.4511 11.6289 18.75C11.6289 19.0489 11.5101 19.3355 11.2988 19.5469C11.0874 19.7582 10.8008 19.877 10.5019 19.877C10.203 19.877 9.91638 19.7582 9.70503 19.5469L2.95503 12.7969C2.85015 12.6924 2.76694 12.5682 2.71016 12.4314C2.65337 12.2947 2.62415 12.1481 2.62415 12C2.62415 11.8519 2.65337 11.7053 2.71016 11.5686C2.76694 11.4318 2.85015 11.3076 2.95503 11.2031L9.70503 4.45312C9.80968 4.34848 9.93391 4.26547 10.0706 4.20883C10.2074 4.1522 10.3539 4.12305 10.5019 4.12305C10.6499 4.12305 10.7964 4.1522 10.9332 4.20883C11.0699 4.26547 11.1941 4.34848 11.2988 4.45312C11.4034 4.55777 11.4864 4.682 11.5431 4.81873C11.5997 4.95546 11.6289 5.102 11.6289 5.25C11.6289 5.39799 11.5997 5.54454 11.5431 5.68126C11.4864 5.81799 11.4034 5.94223 11.2988 6.04687L6.46878 10.8741H20.25C20.5484 10.8741 20.8345 10.9926 21.0455 11.2036C21.2565 11.4145 21.375 11.7007 21.375 11.9991Z" fill="#64748B"/>
              </svg>
            </button>
          )}
          <div>
            <h1 className="packing-page-title">Distribución en Cajas</h1>
            <p className="packing-page-subtitle">Orden {order.numero_orden} - {order.cliente}</p>
          </div>
        </div>
        <div className="packing-header-badges">
          <div className={`packing-estado-badge ${getEstadoBadgeClass(order.estado)}`}>
            {getEstadoLabel(order.estado)}
          </div>
        </div>
      </div>

      <div className="packing-content">
        <div className="packing-stats-grid">
          <div className="packing-stat-card">
            <div className="packing-stat-icon" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6H16V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6H4C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6ZM10 4H14V6H10V4ZM20 19H4V8H8V10C8 10.2652 8.10536 10.5196 8.29289 10.7071C8.48043 10.8946 8.73478 11 9 11C9.26522 11 9.51957 10.8946 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V8H14V10C14 10.2652 14.1054 10.5196 14.2929 10.7071C14.4804 10.8946 14.7348 11 15 11C15.2652 11 15.5196 10.8946 15.7071 10.7071C15.8946 10.5196 16 10.2652 16 10V8H20V19Z" fill="white"/>
              </svg>
            </div>
            <div className="packing-stat-content">
              <span className="packing-stat-label">Total Cajas</span>
              <span className="packing-stat-value">{resumen.total_cajas}</span>
            </div>
          </div>

          <div className="packing-stat-card">
            <div className="packing-stat-icon" style={{ background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="packing-stat-content">
              <span className="packing-stat-label">Cajas Cerradas</span>
              <span className="packing-stat-value">{resumen.cajas_cerradas}</span>
            </div>
          </div>

          <div className="packing-stat-card">
            <div className="packing-stat-icon" style={{ background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="packing-stat-content">
              <span className="packing-stat-label">Cajas Abiertas</span>
              <span className="packing-stat-value">{resumen.cajas_abiertas}</span>
            </div>
          </div>

          <div className="packing-stat-card">
            <div className="packing-stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="packing-stat-content">
              <span className="packing-stat-label">Items Empacados</span>
              <span className="packing-stat-value">{resumen.total_items_empacados}</span>
            </div>
          </div>
        </div>

        <div className="packing-order-summary-card">
          <h2 className="packing-card-title">Resumen de Orden</h2>
          <div className="packing-summary-grid">
            <div className="packing-summary-item">
              <span className="packing-summary-label">Total Productos</span>
              <span className="packing-summary-value">{order.total_productos}</span>
            </div>
            <div className="packing-summary-item">
              <span className="packing-summary-label">Productos Empacados</span>
              <span className="packing-summary-value packing-success-text">{order.productos_empacados}</span>
            </div>
            <div className="packing-summary-item">
              <span className="packing-summary-label">Productos Pendientes</span>
              <span className="packing-summary-value packing-warning-text">{order.productos_pendientes}</span>
            </div>
            <div className="packing-summary-item">
              <span className="packing-summary-label">Caja Activa</span>
              <span className="packing-summary-value">{order.caja_activa_id ? `#${order.caja_activa_id}` : 'Ninguna'}</span>
            </div>
          </div>
        </div>

        <div className="packing-boxes-section">
          <div className="packing-section-header">
            <h2 className="packing-section-title">Cajas de la Orden ({cajas.length})</h2>
          </div>

          <div className="packing-boxes-grid">
            {cajas.map((caja) => (
              <div key={caja.id} className={`packing-box-card ${caja.estado === 'OPEN' ? 'packing-box-card-active' : ''}`}>
                <div className="packing-box-card-header">
                  <div className="packing-box-title-row">
                    <h3 className="packing-box-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6H16V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6H4C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6Z" fill="#667EEA"/>
                      </svg>
                      Caja #{caja.numero_caja}
                    </h3>
                    <div className={`packing-box-estado-badge ${getEstadoBadgeClass(caja.estado)}`}>
                      {getEstadoLabel(caja.estado)}
                    </div>
                  </div>
                  <p className="packing-box-code">{caja.codigo_caja}</p>
                </div>

                <div className="packing-box-info-grid">
                  <div className="packing-box-info-item">
                    <span className="packing-box-info-label">Total Items</span>
                    <span className="packing-box-info-value">{caja.total_items}</span>
                  </div>
                  {caja.peso_kg && (
                    <div className="packing-box-info-item">
                      <span className="packing-box-info-label">Peso</span>
                      <span className="packing-box-info-value">{caja.peso_kg} kg</span>
                    </div>
                  )}
                  {caja.dimensiones && (
                    <div className="packing-box-info-item">
                      <span className="packing-box-info-label">Dimensiones</span>
                      <span className="packing-box-info-value">{caja.dimensiones} cm</span>
                    </div>
                  )}
                </div>

                <div className="packing-box-dates">
                  <div className="packing-box-date-item">
                    <span className="packing-box-date-label">📅 Apertura:</span>
                    <span className="packing-box-date-value">{formatDate(caja.fecha_apertura)}</span>
                  </div>
                  {caja.fecha_cierre && (
                    <div className="packing-box-date-item">
                      <span className="packing-box-date-label">🔒 Cierre:</span>
                      <span className="packing-box-date-value">{formatDate(caja.fecha_cierre)}</span>
                    </div>
                  )}
                </div>

                <div className="packing-box-products">
                  <h4 className="packing-products-subtitle">Productos en esta caja ({caja.productos.length})</h4>
                  <div className="packing-products-list">
                    {caja.productos.map((producto, idx) => (
                      <div key={idx} className="packing-product-row">
                        <div className="packing-product-image">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" fill="#94A3B8"/>
                            <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 22.08V12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="packing-product-info">
                          <span className="packing-product-name">{producto.producto_nombre}</span>
                          {producto.sku && (
                            <span className="packing-product-sku">SKU: {producto.sku}</span>
                          )}
                          {(producto.color || producto.talla) && (
                            <span className="packing-product-specs">
                              {producto.color && `Color: ${producto.color}`}
                              {producto.color && producto.talla && ' | '}
                              {producto.talla && `Talla: ${producto.talla}`}
                            </span>
                          )}
                        </div>
                        <div className="packing-product-quantity">
                          <span className="packing-quantity-badge">
                            {producto.cantidad_en_caja}/{producto.cantidad_total_solicitada}
                          </span>
                          <span className="packing-quantity-percentage">{producto.porcentaje_en_caja.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {caja.estado === 'OPEN' && (
                  <button
                    className="packing-close-box-button"
                    onClick={() => handleCloseBox(caja.id, caja.codigo_caja)}
                    disabled={closingBox === caja.id}
                  >
                    {closingBox === caja.id ? (
                      <>
                        <div className="packing-spinner-small"></div>
                        <span>Cerrando...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                        </svg>
                        <span>Cerrar Caja</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {showConfirmButton && (
          <div className="packing-confirm-section">
            <button
              className="packing-confirm-btn"
              onClick={onConfirmBoxes || (() => alert('Funcionalidad pendiente de conectar'))}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Confirmar Cajas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PackingDistribution
