import { warehouseService } from '../services/warehouseService'

function WarehouseLocationModal({ location, onClose }) {
  if (!location) return null

  const status = warehouseService.getStockStatus(location)
  const statusColor = warehouseService.getStatusColor(status)

  const statusLabels = {
    optimal: 'Stock Óptimo',
    low: 'Stock Bajo',
    empty: 'Vacío',
    inactive: 'Inactiva'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content warehouse-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles de Ubicación</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="location-detail-card">
            <div className="detail-row">
              <span className="detail-label">Código de Ubicación:</span>
              <span className="detail-value location-code-value">{location.code}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Pasillo:</span>
              <span className="detail-value">{location.pasillo}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Lado:</span>
              <span className="detail-value">{location.lado === 'IZQUIERDA' ? 'Izquierdo' : 'Derecho'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Altura:</span>
              <span className="detail-value">Nivel {location.altura}</span>
            </div>

            <div className="detail-divider"></div>

            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className="detail-value">
                <span className="status-badge" style={{ backgroundColor: statusColor }}>
                  {statusLabels[status]}
                </span>
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Stock Actual:</span>
              <span className="detail-value stock-value">{location.stock_actual}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Stock Mínimo:</span>
              <span className="detail-value">{location.stock_minimo}</span>
            </div>

            <div className="detail-divider"></div>

            {location.product_name ? (
              <>
                <div className="detail-row">
                  <span className="detail-label">Producto:</span>
                  <span className="detail-value">{location.product_name}</span>
                </div>

                {location.product_sku && (
                  <div className="detail-row">
                    <span className="detail-label">SKU:</span>
                    <span className="detail-value">{location.product_sku}</span>
                  </div>
                )}

                {location.product_id && (
                  <div className="detail-row">
                    <span className="detail-label">ID Producto:</span>
                    <span className="detail-value">#{location.product_id}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="detail-row">
                <span className="detail-label">Producto:</span>
                <span className="detail-value empty-text">Sin producto asignado</span>
              </div>
            )}

            <div className="detail-divider"></div>

            <div className="detail-row">
              <span className="detail-label">Prioridad:</span>
              <span className="detail-value">{location.prioridad}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Estado de Ubicación:</span>
              <span className="detail-value">
                {location.activa ? (
                  <span className="active-badge">Activa</span>
                ) : (
                  <span className="inactive-badge">Inactiva</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default WarehouseLocationModal
