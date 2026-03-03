import { useState, useEffect, useMemo } from 'react'
import './WarehouseMap.css'
import { warehouseService } from './services/warehouseService'
import WarehouseAisle from './components/WarehouseAisle'
import WarehouseLocationModal from './components/WarehouseLocationModal'

function WarehouseMap() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [almacenId] = useState(1)

  useEffect(() => {
    fetchLocations()
  }, [almacenId])

  const fetchLocations = async () => {
    try {
      console.log('🔍 Iniciando carga de ubicaciones...')
      setLoading(true)
      setError(null)
      const data = await warehouseService.getAllLocations(almacenId, true)
      console.log('✅ Datos recibidos:', data)
      setLocations(data.locations || [])
      console.log('✅ Locations actualizadas, total:', data.locations?.length)
    } catch (err) {
      console.error('❌ Error al cargar ubicaciones:', err)
      setError(err.message || 'Error al cargar ubicaciones del almacén')
    } finally {
      console.log('✅ Finalizando carga (setLoading false)')
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    return warehouseService.calculateStats(locations)
  }, [locations])

  const filteredLocations = useMemo(() => {
    let filtered = [...locations]

    if (activeFilter !== 'all') {
      filtered = filtered.filter(loc => {
        const status = warehouseService.getStockStatus(loc)
        if (activeFilter === 'optimal') return status === 'optimal'
        if (activeFilter === 'low') return status === 'low'
        if (activeFilter === 'empty') return status === 'empty'
        if (activeFilter === 'inactive') return status === 'inactive'
        return true
      })
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(loc => 
        loc.code?.toLowerCase().includes(term) ||
        loc.product_name?.toLowerCase().includes(term) ||
        loc.product_sku?.toLowerCase().includes(term) ||
        loc.pasillo?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [locations, activeFilter, searchTerm])

  const groupedLocations = useMemo(() => {
    return warehouseService.groupLocationsByStructure(filteredLocations)
  }, [filteredLocations])

  const pasillos = useMemo(() => {
    return Object.keys(groupedLocations).sort()
  }, [groupedLocations])

  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedLocation(null)
  }

  if (loading) {
    return (
      <div className="warehouse-map-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando mapa del almacén...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="warehouse-map-container">
        <div className="error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchLocations}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="warehouse-map-container">
      <div className="warehouse-header">
        <div className="warehouse-title-section">
          <h1 className="warehouse-title">Mapa del Almacén</h1>
          <p className="warehouse-subtitle">Visualización de todas las ubicaciones</p>
        </div>

        <div className="warehouse-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-optimal">
            <span className="stat-value">{stats.stockOptimo}</span>
            <span className="stat-label">Stock OK</span>
          </div>
          <div className="stat-card stat-low">
            <span className="stat-value">{stats.stockBajo}</span>
            <span className="stat-label">Stock Bajo</span>
          </div>
          <div className="stat-card stat-empty">
            <span className="stat-value">{stats.vacias}</span>
            <span className="stat-label">Vacías</span>
          </div>
          <div className="stat-card stat-inactive">
            <span className="stat-value">{stats.inactivas}</span>
            <span className="stat-label">Inactivas</span>
          </div>
        </div>
      </div>

      <div className="warehouse-controls">
        <div className="warehouse-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos ({stats.total})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'optimal' ? 'active' : ''}`}
            onClick={() => setActiveFilter('optimal')}
          >
            <span className="filter-dot optimal"></span>
            Stock OK ({stats.stockOptimo})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'low' ? 'active' : ''}`}
            onClick={() => setActiveFilter('low')}
          >
            <span className="filter-dot low"></span>
            Stock Bajo ({stats.stockBajo})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'empty' ? 'active' : ''}`}
            onClick={() => setActiveFilter('empty')}
          >
            <span className="filter-dot empty"></span>
            Vacías ({stats.vacias})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveFilter('inactive')}
          >
            <span className="filter-dot inactive"></span>
            Inactivas ({stats.inactivas})
          </button>
        </div>

        <div className="warehouse-search">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text"
            className="search-input"
            placeholder="Buscar por ubicación, producto o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="warehouse-content">
        {pasillos.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No se encontraron ubicaciones</p>
            <span>Intenta ajustar los filtros de búsqueda</span>
          </div>
        ) : (
          <div className="warehouse-aisles">
            {pasillos.map(pasillo => (
              <WarehouseAisle
                key={pasillo}
                pasillo={pasillo}
                sideData={groupedLocations[pasillo]}
                onLocationClick={handleLocationClick}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && selectedLocation && (
        <WarehouseLocationModal
          location={selectedLocation}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default WarehouseMap
