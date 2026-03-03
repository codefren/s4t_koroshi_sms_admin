import { warehouseService } from '../services/warehouseService'

function WarehouseLocationCell({ location, onClick }) {
  if (!location) {
    return <div className="location-cell empty-cell"></div>
  }

  const status = warehouseService.getStockStatus(location)
  const statusColor = warehouseService.getStatusColor(status)

  return (
    <div 
      className={`location-cell location-${status}`}
      style={{ borderLeftColor: statusColor }}
      onClick={() => onClick(location)}
    >
      <div className="location-code">{location.code}</div>
      <div className="location-stock">
        <span className="stock-badge" style={{ backgroundColor: statusColor }}>
          {location.stock_actual}/{location.stock_minimo}
        </span>
      </div>
      {location.product_name && (
        <div className="location-product">{location.product_name}</div>
      )}
      {!location.activa && (
        <div className="location-inactive-badge">Inactiva</div>
      )}
    </div>
  )
}

export default WarehouseLocationCell
