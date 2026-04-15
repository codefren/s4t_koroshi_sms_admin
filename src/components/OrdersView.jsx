import { useState, useEffect, useMemo } from 'react'
import { SearchIcon, NotificationIcon, ClipboardIcon, ClockIcon, WarningIcon, CheckCircleIcon, SpinnerIcon, TimeIcon, EyeIcon, BoxIcon, AssignIcon } from './icons'
import { getPriorityClass, getPriorityLabel, getStatusClass, formatDate } from '../utils/orderHelpers'
import { almacenService } from '../services/almacenService'
import { orderService } from '../services/orderService'

/**
 * Mapeo de opciones de filtro a valores de estado_codigo de la API
 */
const STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Asignado', value: 'ASSIGNED' },
  { label: 'En Picking', value: 'IN_PICKING' },
  { label: 'Picked', value: 'PICKED' },
  { label: 'Packing', value: 'PACKING' },
  { label: 'Listo', value: 'READY' },
  { label: 'Enviado', value: 'SHIPPED' },
  { label: 'Cancelado', value: 'CANCELLED' },
]

const PRIORITY_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Urgente', value: 'URGENT' },
  { label: 'Alta', value: 'HIGH' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Baja', value: 'LOW' },
]

const TYPE_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'B2B', value: 'B2B' },
  { label: 'B2C', value: 'PV' },
]

function OrdersView({
  orders,
  loading,
  error,
  lastUpdate,
  isRefreshing,
  pagination,
  filters,
  totalOrders,
  onViewOrder,
  onViewPacking,
  onUpdatePriority,
  onPaginationChange,
  onFiltersChange,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [almacenes, setAlmacenes] = useState([])
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false)
  const [draftFilters, setDraftFilters] = useState(filters)

  // Historia de orden
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [historyOrderId, setHistoryOrderId] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)

  // Cargar lista de almacenes al montar
  useEffect(() => {
    const fetchAlmacenes = async () => {
      try {
        setLoadingAlmacenes(true)
        const data = await almacenService.getAll({ skip: 0, limit: 100 })
        setAlmacenes(data)
      } catch (err) {
        console.error('Error al cargar almacenes:', err)
      } finally {
        setLoadingAlmacenes(false)
      }
    }
    fetchAlmacenes()
  }, [])

  // Cargar historial de una orden
  const handleViewHistory = async (orderId, orderNumber) => {
    try {
      setHistoryOrderId(orderNumber || orderId)
      setHistoryLoading(true)
      setHistoryError(null)
      setShowHistoryModal(true)
      const data = await orderService.getHistory(orderId)
      setHistoryData(Array.isArray(data) ? data : [])
    } catch (err) {
      setHistoryError(err.message)
      setHistoryData([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const formatHistoryDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  // Extraer lista única de operarios de las órdenes
  const operatorOptions = useMemo(() => {
    const ops = new Set()
    orders.forEach(o => {
      if (o.operario_asignado) ops.add(o.operario_asignado)
    })
    return Array.from(ops).sort()
  }, [orders])

  // Filtrado client-side solo para operario y búsqueda (estado y prioridad son server-side)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtro por operario (client-side)
      if (operatorFilter) {
        if (operatorFilter === '__unassigned__') {
          if (order.operario_asignado) return false
        } else if (order.operario_asignado !== operatorFilter) {
          return false
        }
      }
      // Búsqueda por texto (client-side)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchesOrder = order.numero_orden?.toLowerCase().includes(term)
        const matchesClient = order.nombre_cliente?.toLowerCase().includes(term) || order.cliente?.toLowerCase().includes(term)
        const matchesOperator = order.operario_asignado?.toLowerCase().includes(term)
        if (!matchesOrder && !matchesClient && !matchesOperator) return false
      }
      return true
    })
  }, [orders, operatorFilter, searchTerm])

  // Calcular paginación
  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1
  const totalPages = Math.ceil(totalOrders / pagination.limit)
  const hasNextPage = orders.length === pagination.limit
  const hasPrevPage = pagination.skip > 0

  // Estadísticas dinámicas calculadas sobre las órdenes totales
  const stats = useMemo(() => {
    const total = orders.length
    const inPicking = orders.filter(o => o.estado_codigo === 'IN_PICKING').length
    const pending = orders.filter(o => o.estado_codigo === 'PENDING').length
    const completed = orders.filter(o => ['PICKED', 'SHIPPED', 'READY'].includes(o.estado_codigo)).length

    return {
      total,
      inPicking,
      pending,
      completed,
      inPickingPct: total > 0 ? Math.round((inPicking / total) * 100) : 0,
      pendingPct: total > 0 ? Math.round((pending / total) * 100) : 0,
      completedPct: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [orders])

  return (
    <>
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div>
            <h1 className="page-title">Gestión de Órdenes</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <p className="page-subtitle">Administra y asigna órdenes a operarios</p>
              {lastUpdate && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontSize: '12px',
                  color: '#64748B',
                  padding: '4px 8px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '6px'
                }}>
                  {isRefreshing ? (
                    <>
                      <SpinnerIcon />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <TimeIcon />
                      <span>Última actualización: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <SearchIcon className="search-icon" color="#94A3B8" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="notification-button">
            <NotificationIcon />
          </button>

          <div className="user-profile">
            <div className="user-avatar"></div>
            <span className="user-name">Admin</span>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Órdenes</span>
              <div className="stat-icon-container">
                <ClipboardIcon />
              </div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.total}</div>
            <div className="stat-change">{filteredOrders.length !== stats.total ? `${filteredOrders.length} filtradas` : 'Todas las órdenes'}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">En Picking</span>
              <div className="stat-icon-container">
                <ClockIcon />
              </div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.inPicking}</div>
            <div className="stat-change">{stats.inPickingPct}% del total</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Pendientes</span>
              <div className="stat-icon-container">
                <WarningIcon />
              </div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.pending}</div>
            <div className="stat-change">{stats.pendingPct}% del total</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Completadas</span>
              <div className="stat-icon-container">
                <CheckCircleIcon />
              </div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.completed}</div>
            <div className="stat-change">{stats.completedPct}% del total</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Estado:</label>
            <select
              className="filter-select"
              value={draftFilters.estado_codigo}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, estado_codigo: e.target.value }))}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Prioridad:</label>
            <select
              className="filter-select"
              value={draftFilters.prioridad}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, prioridad: e.target.value }))}
            >
              {PRIORITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Tipo:</label>
            <select
              className="filter-select"
              value={draftFilters.type}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Almacén:</label>
            <select
              className="filter-select"
              value={draftFilters.almacen_id}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, almacen_id: e.target.value }))}
              disabled={loadingAlmacenes}
            >
              <option value="">Todos</option>
              {almacenes.map(almacen => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.descripciones || almacen.codigo}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Operario:</label>
            <select
              className="filter-select"
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="__unassigned__">Sin asignar</option>
              {operatorOptions.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Desde:</label>
            <input
              type="date"
              className="filter-select"
              value={draftFilters.fecha_desde}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Hasta:</label>
            <input
              type="date"
              className="filter-select"
              value={draftFilters.fecha_hasta}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Por página:</label>
            <select
              className="filter-select"
              value={pagination.limit}
              onChange={(e) => {
                onPaginationChange({ ...pagination, limit: parseInt(e.target.value), skip: 0 })
              }}
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>

          <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
            <button
              className="btn-actualizar-filtros"
              onClick={() => {
                onFiltersChange(draftFilters)
                onPaginationChange({ ...pagination, skip: 0 })
              }}
              disabled={loading}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C9.69494 21 7.59227 20.1334 6 18.7083L3 16M3 12C3 7.02944 7.02944 3 12 3C14.3051 3 16.4077 3.86656 18 5.29168L21 8M3 16V22M3 16H9M21 2V8M21 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <div className="table-header">
            <div>ORDEN/CLIENTE</div>
            <div></div>
            <div style={{ textAlign: 'center' }}>ITEMS</div>
            <div>OPERARIO</div>
            <div>PRIORIDAD</div>
            <div>ESTADO</div>
            <div style={{ textAlign: 'center' }}>ACCIONES</div>
          </div>

          <div className="table-body">
            {loading && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                Cargando órdenes...
              </div>
            )}

            {error && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
                Error: {error}
              </div>
            )}

            {!loading && !error && filteredOrders.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                {orders.length === 0 ? 'No hay órdenes disponibles' : 'No se encontraron órdenes con los filtros aplicados'}
              </div>
            )}

            {!loading && !error && filteredOrders.map((order) => (
            <div className="table-row" key={order.id}>
              <div className="table-cell-order" data-label="Orden">
                <span className="order-id">#{order.numero_orden}</span>
                <span className="order-date">{formatDate(order.fecha_orden)}</span>
              </div>

              <div className="table-cell-client" data-label="Cliente">
                <span className="client-name">{order.nombre_cliente}</span>
                <span className="client-location">{order.cliente}</span>
              </div>

              <div className="table-cell-items" data-label="Items">
                <div className="items-progress-container">
                  <svg className="progress-circle" width="40" height="40" viewBox="0 0 40 40">
                    <circle
                      className="progress-circle-bg"
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                    />
                    <circle
                      className="progress-circle-fill"
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="4"
                      strokeDasharray={`${(order.progreso || 0) * 100.53 / 100} 100.53`}
                      strokeDashoffset="0"
                      transform="rotate(-90 20 20)"
                      strokeLinecap="round"
                    />
                    <text
                      x="20"
                      y="20"
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="10"
                      fontWeight="600"
                      fill="#1F2937"
                    >
                      {Math.round(order.progreso || 0)}%
                    </text>
                  </svg>
                  <div className="items-count-info">
                    <span className="items-completed">{order.items_completados || 0}/{order.total_items || 0}</span>
                    <span className="items-label">items</span>
                  </div>
                </div>
              </div>

              <div className="table-cell-operator" data-label="Operario">
                {order.operario_asignado ? (
                  <>
                    <div className="operator-avatar"></div>
                    <span className="operator-name">{order.operario_asignado}</span>
                  </>
                ) : (
                  <span className="unassigned-text">Sin asignar</span>
                )}
              </div>

              <div className="table-cell-priority" data-label="Prioridad">
                <select
                  className={`priority-select ${getPriorityClass(order.prioridad)}`}
                  value={order.prioridad}
                  onChange={async (e) => {
                    const newPriority = e.target.value
                    const success = await onUpdatePriority(order.id, newPriority)
                    if (!success) {
                      e.target.value = order.prioridad
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="NORMAL">🟢 Normal</option>
                  <option value="HIGH">🟠 Alta</option>
                  <option value="URGENT">🔴 Urgente</option>
                </select>
              </div>

              <div className="table-cell-status" data-label="Estado">
                <div className={`status-badge ${getStatusClass(order.estado_codigo)}`}>
                  {order.estado}
                </div>
              </div>

              <div className="table-cell-actions">
                {!order.operario_asignado && (
                  <button className="action-btn-icon assign" title="Asignar operario" onClick={() => onViewOrder(order.id)}>
                    <AssignIcon />
                  </button>
                )}
                <button className="action-btn-icon packing" title="Cajas" onClick={() => onViewPacking(order.id)}>
                  <BoxIcon />
                </button>
                <button className="action-btn-icon view" title="Ver detalle" onClick={() => onViewOrder(order.id)}>
                  <EyeIcon />
                </button>
                <button className="action-btn-icon history" title="Historia de orden" onClick={() => handleViewHistory(order.id, order.numero_orden)}>
                  <ClockIcon />
                </button>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && !error && totalOrders > 0 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={!hasPrevPage}
              onClick={() => onPaginationChange({ ...pagination, skip: Math.max(0, pagination.skip - pagination.limit) })}
            >
              ← Anterior
            </button>
            
            <div className="pagination-info">
              Página {currentPage} - Mostrando {orders.length} órdenes
              {filters.prioridad || filters.estado_codigo ? ' (con filtros)' : ''}
            </div>
            
            <button
              className="pagination-btn"
              disabled={!hasNextPage}
              onClick={() => onPaginationChange({ ...pagination, skip: pagination.skip + pagination.limit })}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal de Historia de Orden */}
      {showHistoryModal && (
        <div className="order-history-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="order-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-history-header">
              <h2>Historia de Orden #{historyOrderId}</h2>
              <button className="order-history-close" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>

            <div className="order-history-body">
              {historyLoading && (
                <div className="order-history-loading">
                  <div className="order-history-spinner"></div>
                  <p>Cargando historial...</p>
                </div>
              )}

              {historyError && (
                <div className="order-history-error">
                  <p>Error: {historyError}</p>
                </div>
              )}

              {!historyLoading && !historyError && historyData.length === 0 && (
                <div className="order-history-empty">
                  <p>No hay eventos en el historial de esta orden</p>
                </div>
              )}

              {!historyLoading && !historyError && historyData.length > 0 && (
                <div className="order-history-timeline">
                  {historyData.map((event, idx) => (
                    <div key={event.id || idx} className="order-history-event">
                      <div className="order-history-event-dot"></div>
                      <div className="order-history-event-content">
                        <div className="order-history-event-top">
                          <span className="order-history-event-action">{event.accion || 'Evento'}</span>
                          <span className="order-history-event-date">{formatHistoryDate(event.fecha || event.created_at)}</span>
                        </div>
                        {(event.status_anterior || event.status_nuevo) && (
                          <div className="order-history-event-status">
                            <span className="order-history-status-old">{event.status_anterior || '—'}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="order-history-status-new">{event.status_nuevo || '—'}</span>
                          </div>
                        )}
                        {event.notas && (
                          <div className="order-history-event-notes">{event.notas}</div>
                        )}
                        {event.operator_id && (
                          <div className="order-history-event-operator">Operador ID: {event.operator_id}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrdersView
