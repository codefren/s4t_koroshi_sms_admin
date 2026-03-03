import WarehouseLocationCell from './WarehouseLocationCell'

function WarehouseAisle({ pasillo, sideData, onLocationClick }) {
  const maxAlturas = 5

  const renderSide = (lado) => {
    const sideLocations = sideData[lado] || {}
    
    return (
      <div className="aisle-side">
        <div className="aisle-side-label">
          {lado === 'IZQUIERDA' ? 'IZQUIERDO' : 'DERECHO'}
        </div>
        <div className="aisle-levels">
          {[1, 2, 3, 4, 5].map(nivel => (
            <div key={nivel} className="aisle-level">
              <div className="level-label">Nv{nivel}</div>
              <div className="level-cells">
                {sideLocations[nivel] && sideLocations[nivel].length > 0 ? (
                  sideLocations[nivel].map((location, idx) => (
                    <WarehouseLocationCell
                      key={location.id || idx}
                      location={location}
                      onClick={onLocationClick}
                    />
                  ))
                ) : (
                  <div className="location-cell empty-cell">
                    <span className="empty-text">-</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="warehouse-aisle">
      <div className="aisle-header">
        <h3 className="aisle-title">PASILLO {pasillo}</h3>
      </div>
      <div className="aisle-content">
        {renderSide('IZQUIERDA')}
        <div className="aisle-divider"></div>
        {renderSide('DERECHA')}
      </div>
    </div>
  )
}

export default WarehouseAisle
