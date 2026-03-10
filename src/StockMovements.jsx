import { useState, useEffect, useRef, useMemo } from 'react'
import './StockMovements.css'
import { stockMovementService } from './services/stockMovementService'
import { SearchIcon } from './components/icons'

const TIPO_LABELS = {
  RESERVE: { label: 'Reserva', class: 'reserve' },
  DEDUCT: { label: 'Descuento', class: 'deduct' },
  RELEASE: { label: 'Liberación', class: 'release' },
  ADJUSTMENT: { label: 'Ajuste', class: 'adjustment' },
  MOVE_OUT: { label: 'Salida', class: 'move-out' },
  MOVE_IN: { label: 'Entrada', class: 'move-in' },
}

const ITEMS_PER_PAGE = 50

function StockMovements() {
  // Filtros
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Datos
  const [movimientos, setMovimientos] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)

  // Resumen estadístico
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  const abortControllerRef = useRef(null)

  // Debounce en búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchInput])

  // Cargar movimientos
  const fetchMovimientos = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const options = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        signal: abortControllerRef.current.signal,
      }

      if (activeFilter !== 'all') options.tipo = activeFilter
      if (fechaDesde) options.fecha_desde = fechaDesde
      if (fechaHasta) options.fecha_hasta = fechaHasta
      if (searchTerm) options.order_id = searchTerm

      const data = await stockMovementService.getAll(options)

      setMovimientos(data.movimientos || [])
      setEstadisticas(data.estadisticas || {})
      setTotal(data.total || 0)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Error al cargar movimientos')
      console.error('Error al cargar movimientos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar resumen estadístico
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true)
      const options = {}
      if (fechaDesde) options.fecha_desde = fechaDesde
      if (fechaHasta) options.fecha_hasta = fechaHasta

      const data = await stockMovementService.getStatsSummary(options)
      setSummary(data)
    } catch (err) {
      console.error('Error al cargar resumen:', err)
    } finally {
      setLoadingSummary(false)
    }
  }

  // Recargar cuando cambian filtros
  useEffect(() => {
    fetchMovimientos()
  }, [activeFilter, currentPage, fechaDesde, fechaHasta, searchTerm])

  // Recargar resumen cuando cambian fechas
  useEffect(() => {
    fetchSummary()
  }, [fechaDesde, fechaHasta])

  // Reset página al cambiar filtros
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  // Estadísticas para cards
  const statsData = useMemo(() => {
    if (!summary || !summary.estadisticas_por_tipo) {
      return {
        totalMovimientos: total,
        reservas: 0,
        descuentos: 0,
        liberaciones: 0,
      }
    }
    const stats = summary.estadisticas_por_tipo
    return {
      totalMovimientos: summary.total_movimientos || total,
      reservas: stats.RESERVE?.count || 0,
      descuentos: stats.DEDUCT?.count || 0,
      liberaciones: stats.RELEASE?.count || 0,
    }
  }, [summary, total])

  // Paginación
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginationRange = useMemo(() => {
    const pages = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, totalPages])

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Formatear cantidad con signo
  const formatCantidad = (cantidad) => {
    if (cantidad > 0) return `+${cantidad}`
    return `${cantidad}`
  }

  return (
    <div className="stock-movements-container">
      {/* Header */}
      <header className="stock-movements-header">
        <div className="header-left">
          <div className="header-info">
            <h1 className="page-title">Movimientos de Stock</h1>
            <div className="breadcrumb-row">
              <span className="breadcrumb-item">Dashboard</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.64795 6.39746L4.89795 10.1475C4.79228 10.2531 4.64895 10.3125 4.49951 10.3125C4.35007 10.3125 4.20675 10.2531 4.10107 10.1475C3.9954 10.0418 3.93604 9.89847 3.93604 9.74902C3.93604 9.59958 3.9954 9.45626 4.10107 9.35058L7.4531 5.99949L4.10201 2.64746C4.04969 2.59514 4.00818 2.53302 3.97986 2.46466C3.95155 2.39629 3.93697 2.32302 3.93697 2.24902C3.93697 2.17503 3.95155 2.10175 3.97986 2.03339C4.00818 1.96503 4.04969 1.90291 4.10201 1.85059C4.15433 1.79826 4.21645 1.75676 4.28482 1.72844C4.35318 1.70012 4.42645 1.68555 4.50045 1.68555C4.57445 1.68555 4.64772 1.70012 4.71608 1.72844C4.78445 1.75676 4.84656 1.79826 4.89889 1.85059L8.64889 5.60058C8.70126 5.6529 8.7428 5.71505 8.77111 5.78346C8.79942 5.85186 8.81395 5.92518 8.81386 5.99922C8.81377 6.07325 8.79907 6.14654 8.7706 6.21488C8.74213 6.28322 8.70045 6.34526 8.64795 6.39746Z" fill="#8B95A5"/>
              </svg>
              <span className="breadcrumb-active">Movimientos de Stock</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por ID de orden..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="user-section">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/2f71c4ccba3802dc780a520762f2102b900b823a?width=72" alt="Juan Pérez" className="user-avatar" />
            <div className="user-info">
              <div className="user-name">Juan Pérez</div>
              <div className="user-role">Administrador</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="stock-movements-content">
        {/* Stats Cards */}
        <div className="sm-stats-grid">
          <div className="sm-stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Movimientos</div>
              <div className="stat-value">{loadingSummary ? '...' : statsData.totalMovimientos}</div>
            </div>
            <div className="stat-icon-box purple">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3.5C7.1 3.5 3.5 7.1 3.5 14C3.5 20.9 7.1 24.5 14 24.5C20.9 24.5 24.5 20.9 24.5 14C24.5 7.1 20.9 3.5 14 3.5ZM18.375 15.75H14C13.7613 15.75 13.5325 15.6552 13.3637 15.4863C13.1948 15.3175 13.1 15.0887 13.1 14.85V8.575C13.1 8.33625 13.1948 8.1075 13.3637 7.93872C13.5325 7.76994 13.7613 7.675 14 7.675C14.2387 7.675 14.4675 7.76994 14.6363 7.93872C14.8052 8.1075 14.9 8.33625 14.9 8.575V13.95H18.375C18.6138 13.95 18.8425 14.0449 19.0113 14.2137C19.1801 14.3825 19.275 14.6113 19.275 14.85C19.275 15.0887 19.1801 15.3175 19.0113 15.4863C18.8425 15.6552 18.6138 15.75 18.375 15.75Z" fill="white"/>
              </svg>
            </div>
          </div>

          <div className="sm-stat-card">
            <div className="stat-content">
              <div className="stat-label">Reservas</div>
              <div className="stat-value">{loadingSummary ? '...' : statsData.reservas}</div>
            </div>
            <div className="stat-icon-box blue">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.75 7H19.25V5.25C19.25 4.78587 19.0656 4.34075 18.7374 4.01256C18.4092 3.68437 17.9641 3.5 17.5 3.5H10.5C10.0359 3.5 9.59075 3.68437 9.26256 4.01256C8.93437 4.34075 8.75 4.78587 8.75 5.25V7H5.25C4.78587 7 4.34075 7.18437 4.01256 7.51256C3.68437 7.84075 3.5 8.28587 3.5 8.75V22.75C3.5 23.2141 3.68437 23.6592 4.01256 23.9874C4.34075 24.3156 4.78587 24.5 5.25 24.5H22.75C23.2141 24.5 23.6592 24.3156 23.9874 23.9874C24.3156 23.6592 24.5 23.2141 24.5 22.75V8.75C24.5 8.28587 24.3156 7.84075 23.9874 7.51256C23.6592 7.18437 23.2141 7 22.75 7ZM10.5 5.25H17.5V7H10.5V5.25ZM22.75 22.75H5.25V8.75H22.75V22.75Z" fill="white"/>
              </svg>
            </div>
          </div>

          <div className="sm-stat-card">
            <div className="stat-content">
              <div className="stat-label">Descuentos</div>
              <div className="stat-value">{loadingSummary ? '...' : statsData.descuentos}</div>
            </div>
            <div className="stat-icon-box orange">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3.5C8.201 3.5 3.5 8.201 3.5 14C3.5 19.799 8.201 24.5 14 24.5C19.799 24.5 24.5 19.799 24.5 14C24.5 8.201 19.799 3.5 14 3.5ZM18.375 14.875H9.625C9.38625 14.875 9.1575 14.7802 8.98872 14.6113C8.81994 14.4425 8.725 14.2138 8.725 13.975C8.725 13.7363 8.81994 13.5075 8.98872 13.3387C9.1575 13.1699 9.38625 13.075 9.625 13.075H18.375C18.6138 13.075 18.8425 13.1699 19.0113 13.3387C19.1801 13.5075 19.275 13.7363 19.275 13.975C19.275 14.2138 19.1801 14.4425 19.0113 14.6113C18.8425 14.7802 18.6138 14.875 18.375 14.875Z" fill="white"/>
              </svg>
            </div>
          </div>

          <div className="sm-stat-card">
            <div className="stat-content">
              <div className="stat-label">Liberaciones</div>
              <div className="stat-value">{loadingSummary ? '...' : statsData.liberaciones}</div>
            </div>
            <div className="stat-icon-box green">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.3036 10.4464C19.426 10.5683 19.523 10.7132 19.5893 10.8728C19.6555 11.0323 19.6896 11.2034 19.6896 11.3761C19.6896 11.5488 19.6555 11.7199 19.5893 11.8794C19.523 12.039 19.426 12.1838 19.3036 12.3058L13.1786 18.4308C13.0567 18.5531 12.9118 18.6502 12.7522 18.7165C12.5927 18.7827 12.4217 18.8168 12.2489 18.8168C12.0762 18.8168 11.9051 18.7827 11.7456 18.7165C11.5861 18.6502 11.4412 18.5531 11.3192 18.4308L8.69422 15.8058C8.57214 15.6837 8.47529 15.5388 8.40922 15.3792C8.34314 15.2197 8.30913 15.0488 8.30913 14.8761C8.30913 14.7034 8.34314 14.5325 8.40922 14.373C8.47529 14.2134 8.57214 14.0685 8.69422 13.9464C8.81631 13.8243 8.96125 13.7275 9.12077 13.6614C9.28028 13.5953 9.45125 13.5613 9.62391 13.5613C9.79657 13.5613 9.96754 13.5953 10.1271 13.6614C10.2866 13.7275 10.4315 13.8243 10.5536 13.9464L12.25 15.6406L17.4464 10.4431C17.5685 10.3213 17.7134 10.2248 17.8729 10.159C18.0324 10.0932 18.2032 10.0595 18.3757 10.0598C18.5482 10.0601 18.7189 10.0944 18.8781 10.1608C19.0373 10.2271 19.1819 10.3242 19.3036 10.4464ZM25.8125 14C25.8125 16.3363 25.1197 18.6201 23.8217 20.5627C22.5238 22.5052 20.6789 24.0193 18.5205 24.9133C16.362 25.8074 13.9869 26.0413 11.6955 25.5855C9.4041 25.1297 7.29931 24.0047 5.64731 22.3527C3.9953 20.7007 2.87027 18.5959 2.41448 16.3045C1.95869 14.0131 2.19262 11.638 3.08668 9.47955C3.98074 7.3211 5.49478 5.47624 7.43733 4.17827C9.37989 2.88029 11.6637 2.1875 14 2.1875C17.1318 2.19097 20.1343 3.43662 22.3489 5.65114C24.5634 7.86566 25.809 10.8682 25.8125 14Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="sm-filters-bar">
          <div className="sm-filters-left">
            <div className="sm-date-filters">
              <div className="sm-date-group">
                <label className="sm-date-label">Desde</label>
                <input
                  type="date"
                  className="sm-date-input"
                  value={fechaDesde}
                  onChange={(e) => { setFechaDesde(e.target.value); setCurrentPage(1) }}
                />
              </div>
              <div className="sm-date-group">
                <label className="sm-date-label">Hasta</label>
                <input
                  type="date"
                  className="sm-date-input"
                  value={fechaHasta}
                  onChange={(e) => { setFechaHasta(e.target.value); setCurrentPage(1) }}
                />
              </div>
              {(fechaDesde || fechaHasta) && (
                <button
                  className="sm-clear-dates-btn"
                  onClick={() => { setFechaDesde(''); setFechaHasta(''); setCurrentPage(1) }}
                >
                  Limpiar fechas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="sm-table-wrapper">
          <div className="sm-table-toolbar">
            <div className="toolbar-left-section">
              <h2 className="sm-table-title">Historial de Movimientos</h2>
              <span className="sm-count-badge">{total} registros</span>
            </div>
          </div>

          {/* Type Filters */}
          <div className="sm-table-filters">
            <button
              className={`sm-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 4.5H15.75M2.25 9H15.75M2.25 13.5H15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Todos
            </button>
            <button
              className={`sm-filter-btn ${activeFilter === 'RESERVE' ? 'active' : ''}`}
              onClick={() => handleFilterChange('RESERVE')}
            >
              Reservas
            </button>
            <button
              className={`sm-filter-btn ${activeFilter === 'DEDUCT' ? 'active' : ''}`}
              onClick={() => handleFilterChange('DEDUCT')}
            >
              Descuentos
            </button>
            <button
              className={`sm-filter-btn ${activeFilter === 'RELEASE' ? 'active' : ''}`}
              onClick={() => handleFilterChange('RELEASE')}
            >
              Liberaciones
            </button>
            <button
              className={`sm-filter-btn ${activeFilter === 'ADJUSTMENT' ? 'active' : ''}`}
              onClick={() => handleFilterChange('ADJUSTMENT')}
            >
              Ajustes
            </button>
            <button
              className={`sm-filter-btn ${activeFilter === 'MOVE_OUT' ? 'active' : ''}`}
              onClick={() => handleFilterChange('MOVE_OUT')}
            >
              Salidas
            </button>
            <button
              className={`sm-filter-btn ${activeFilter === 'MOVE_IN' ? 'active' : ''}`}
              onClick={() => handleFilterChange('MOVE_IN')}
            >
              Entradas
            </button>
          </div>

          {/* Table Header */}
          <div className="sm-table">
            <div className="sm-table-header">
              <span>FECHA</span>
              <span>TIPO</span>
              <span>PRODUCTO</span>
              <span>UBICACIÓN</span>
              <span>CANTIDAD</span>
              <span>STOCK</span>
              <span>ORDEN</span>
            </div>

            {/* Table Body */}
            <div className="sm-table-body">
              {loading ? (
                <div className="sm-loading-state">
                  <div className="sm-spinner"></div>
                  <span>Cargando movimientos...</span>
                </div>
              ) : error ? (
                <div className="sm-error-state">
                  <span>{error}</span>
                  <button className="sm-retry-btn" onClick={fetchMovimientos}>Reintentar</button>
                </div>
              ) : movimientos.length === 0 ? (
                <div className="sm-empty-state">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24C44 12.954 35.046 4 24 4ZM24 34C23.45 34 23 33.55 23 33V23C23 22.45 23.45 22 24 22C24.55 22 25 22.45 25 23V33C25 33.55 24.55 34 24 34ZM25 18H23V14H25V18Z" fill="#CBD5E0"/>
                  </svg>
                  <span>No se encontraron movimientos de stock</span>
                </div>
              ) : (
                movimientos.map((mov) => {
                  const tipoInfo = TIPO_LABELS[mov.tipo] || { label: mov.tipo, class: 'default' }
                  const cantidadClass = mov.cantidad >= 0 ? 'positive' : 'negative'

                  return (
                    <div key={mov.id} className="sm-row">
                      <div className="sm-cell sm-cell-fecha">
                        <span className="sm-fecha-date">{formatDate(mov.created_at)}</span>
                      </div>

                      <div className="sm-cell sm-cell-tipo">
                        <span className={`sm-tipo-badge ${tipoInfo.class}`}>
                          {tipoInfo.label}
                        </span>
                      </div>

                      <div className="sm-cell sm-cell-producto">
                        <span className="sm-producto-sku">{mov.producto_sku || '-'}</span>
                        <span className="sm-producto-nombre">{mov.producto_nombre || '-'}</span>
                        {(mov.producto_color || mov.producto_talla) && (
                          <span className="sm-producto-variante">
                            {[mov.producto_color, mov.producto_talla].filter(Boolean).join(' / ')}
                          </span>
                        )}
                      </div>

                      <div className="sm-cell sm-cell-ubicacion">
                        <span className="sm-ubicacion-code">{mov.ubicacion_codigo || '-'}</span>
                      </div>

                      <div className="sm-cell sm-cell-cantidad">
                        <span className={`sm-cantidad ${cantidadClass}`}>
                          {formatCantidad(mov.cantidad)}
                        </span>
                      </div>

                      <div className="sm-cell sm-cell-stock">
                        <div className="sm-stock-change">
                          <span className="sm-stock-antes">{mov.stock_antes}</span>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.375 7L2.625 7M11.375 7L8.3125 4.375M11.375 7L8.3125 9.625" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="sm-stock-despues">{mov.stock_despues}</span>
                        </div>
                      </div>

                      <div className="sm-cell sm-cell-orden">
                        {mov.numero_orden ? (
                          <span className="sm-orden-link">{mov.numero_orden}</span>
                        ) : (
                          <span className="sm-orden-na">-</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sm-pagination">
              <span className="pagination-text">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, total)} de {total}
              </span>
              <div className="pagination-buttons">
                <button
                  className="pagination-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {paginationRange.map((page) => (
                  <button
                    key={page}
                    className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="pagination-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StockMovements
