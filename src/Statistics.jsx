import { useState } from 'react'
import './Statistics.css'

// ============ MOCK DATA ============

const KPI_DATA = [
  {
    label: 'Órdenes Procesadas',
    value: '1,247',
    change: '+12.5%',
    changeType: 'positive',
    period: 'vs mes anterior',
    color: 'blue',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.875 3.5H17.9091C17.4174 2.94938 16.8151 2.50896 16.1414 2.20741C15.4678 1.90587 14.738 1.75 14 1.75C13.262 1.75 12.5322 1.90587 11.8586 2.20741C11.1849 2.50896 10.5826 2.94938 10.0909 3.5H6.125C5.66087 3.5 5.21575 3.68437 4.88756 4.01256C4.55937 4.34075 4.375 4.78587 4.375 5.25V23.625C4.375 24.0891 4.55937 24.5342 4.88756 24.8624C5.21575 25.1906 5.66087 25.375 6.125 25.375H21.875C22.3391 25.375 22.7842 25.1906 23.1124 24.8624C23.4406 24.5342 23.625 24.0891 23.625 23.625V5.25C23.625 4.78587 23.4406 4.34075 23.1124 4.01256C22.7842 3.68437 22.3391 3.5 21.875 3.5ZM14 3.5C14.9283 3.5 15.8185 3.86875 16.4749 4.52513C17.1313 5.1815 17.5 6.07174 17.5 7H10.5C10.5 6.07174 10.8687 5.1815 11.5251 4.52513C12.1815 3.86875 13.0717 3.5 14 3.5Z" fill="white"/>
      </svg>
    ),
  },
  {
    label: 'Tiempo Promedio Picking',
    value: '8.3 min',
    change: '-15%',
    changeType: 'positive',
    period: 'vs mes anterior',
    color: 'green',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 3.5C7.1 3.5 3.5 7.1 3.5 14C3.5 20.9 7.1 24.5 14 24.5C20.9 24.5 24.5 20.9 24.5 14C24.5 7.1 20.9 3.5 14 3.5ZM18.375 15.75H14C13.7613 15.75 13.5325 15.6552 13.3637 15.4863C13.1948 15.3175 13.1 15.0887 13.1 14.85V8.575C13.1 8.33625 13.1948 8.1075 13.3637 7.93872C13.5325 7.76994 13.7613 7.675 14 7.675C14.2387 7.675 14.4675 7.76994 14.6363 7.93872C14.8052 8.1075 14.9 8.33625 14.9 8.575V13.95H18.375C18.6138 13.95 18.8425 14.0449 19.0113 14.2137C19.1801 14.3825 19.275 14.6113 19.275 14.85C19.275 15.0887 19.1801 15.3175 19.0113 15.4863C18.8425 15.6552 18.6138 15.75 18.375 15.75Z" fill="white"/>
      </svg>
    ),
  },
  {
    label: 'Ocupación Almacén',
    value: '78.4%',
    change: '+3.2%',
    changeType: 'neutral',
    period: 'vs mes anterior',
    color: 'purple',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.5 21.875H23.625V4.375C23.625 4.14294 23.5328 3.92038 23.3687 3.75628C23.2046 3.59219 22.9821 3.5 22.75 3.5H16.625C16.3929 3.5 16.1704 3.59219 16.0063 3.75628C15.8422 3.92038 15.75 4.14294 15.75 4.375V8.75H10.5C10.2679 8.75 10.0454 8.84219 9.88128 9.00628C9.71719 9.17038 9.625 9.39294 9.625 9.625V14H5.25C5.01794 14 4.79538 14.0922 4.63128 14.2563C4.46719 14.4204 4.375 14.6429 4.375 14.875V21.875H3.5C3.26794 21.875 3.04538 21.9672 2.88128 22.1313C2.71719 22.2954 2.625 22.5179 2.625 22.75C2.625 22.9821 2.71719 23.2046 2.88128 23.3687C3.04538 23.5328 3.26794 23.625 3.5 23.625H24.5C24.7321 23.625 24.9546 23.5328 25.1187 23.3687C25.2828 23.2046 25.375 22.9821 25.375 22.75C25.375 22.5179 25.2828 22.2046 25.1187 22.1313C24.9546 21.9672 24.7321 21.875 24.5 21.875ZM17.5 5.25H21.875V21.875H17.5V5.25ZM11.375 10.5H15.75V21.875H11.375V10.5ZM6.125 15.75H9.625V21.875H6.125V15.75Z" fill="white"/>
      </svg>
    ),
  },
  {
    label: 'Tasa de Error',
    value: '1.2%',
    change: '-0.3%',
    changeType: 'positive',
    period: 'vs mes anterior',
    color: 'orange',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 3.5C8.201 3.5 3.5 8.201 3.5 14C3.5 19.799 8.201 24.5 14 24.5C19.799 24.5 24.5 19.799 24.5 14C24.5 8.201 19.799 3.5 14 3.5ZM14 19.25C13.6548 19.25 13.3194 19.1476 13.0347 18.9571C12.7499 18.7666 12.5295 18.4962 12.4016 18.1806C12.2738 17.865 12.2441 17.518 12.3163 17.1842C12.3886 16.8504 12.5594 16.5448 12.8058 16.3058C13.0523 16.0669 13.3632 15.9052 13.699 15.8428C14.0349 15.7805 14.3811 15.8204 14.6928 15.9575C15.0045 16.0946 15.2683 16.3228 15.4505 16.6128C15.6326 16.9028 15.725 17.2411 15.715 17.5862C15.7019 18.0362 15.5123 18.4629 15.1876 18.7772C14.8628 19.0916 14.4303 19.2674 13.98 19.266L14 19.25ZM15.225 12.845L14.7 14.42C14.6596 14.5405 14.5842 14.6462 14.4837 14.7238C14.3832 14.8013 14.2622 14.8476 14.1358 14.8568C14.0094 14.866 13.8831 14.8378 13.7725 14.7758C13.662 14.7138 13.5721 14.6206 13.514 14.508L12.754 12.992C12.6706 12.8252 12.6343 12.638 12.6493 12.4514C12.6644 12.2648 12.7302 12.086 12.839 11.935L13.685 10.745C13.8162 10.5602 13.9938 10.4128 14.2002 10.318C14.4066 10.2232 14.6342 10.1842 14.8606 10.205C15.0869 10.2258 15.3035 10.3057 15.4894 10.4365C15.6753 10.5673 15.8237 10.7444 15.9194 10.9503C16.0152 11.1563 16.0552 11.3837 16.0354 11.6101C16.0156 11.8366 15.9367 12.054 15.8065 12.2405L15.225 12.845Z" fill="white"/>
      </svg>
    ),
  },
]

const WEEKLY_ORDERS = [
  { day: 'Lun', value: 185, fullDay: 'Lunes' },
  { day: 'Mar', value: 210, fullDay: 'Martes' },
  { day: 'Mié', value: 195, fullDay: 'Miércoles' },
  { day: 'Jue', value: 238, fullDay: 'Jueves' },
  { day: 'Vie', value: 262, fullDay: 'Viernes' },
  { day: 'Sáb', value: 145, fullDay: 'Sábado' },
  { day: 'Dom', value: 72, fullDay: 'Domingo' },
]

const STOCK_DISTRIBUTION = [
  { label: 'Stock Óptimo', value: 45, color: '#22C55E' },
  { label: 'Stock Bajo', value: 30, color: '#F59E0B' },
  { label: 'Sin Stock', value: 10, color: '#EF4444' },
  { label: 'Sobre Stock', value: 15, color: '#3B82F6' },
]

const OPERATORS_DATA = [
  { name: 'Carlos Martínez', ordenes: 312, tiempoPromedio: '6.2 min', eficiencia: 96 },
  { name: 'Ana García', ordenes: 289, tiempoPromedio: '7.1 min', eficiencia: 92 },
  { name: 'Miguel López', ordenes: 275, tiempoPromedio: '7.5 min', eficiencia: 88 },
  { name: 'Laura Sánchez', ordenes: 261, tiempoPromedio: '8.0 min', eficiencia: 85 },
  { name: 'Pedro Ruiz', ordenes: 243, tiempoPromedio: '8.4 min', eficiencia: 81 },
]

const TOP_PRODUCTS = [
  { sku: 'KOR-BLK-M-001', nombre: 'Camiseta Negra Talla M', movimientos: 487, stock: 156, tendencia: 'up' },
  { sku: 'KOR-WHT-L-003', nombre: 'Camiseta Blanca Talla L', movimientos: 423, stock: 89, tendencia: 'up' },
  { sku: 'KOR-RED-S-012', nombre: 'Polo Rojo Talla S', movimientos: 391, stock: 34, tendencia: 'down' },
  { sku: 'KOR-BLU-XL-007', nombre: 'Sudadera Azul Talla XL', movimientos: 356, stock: 210, tendencia: 'up' },
  { sku: 'KOR-GRY-M-019', nombre: 'Pantalón Gris Talla M', movimientos: 312, stock: 12, tendencia: 'down' },
]

// ============ COMPONENT ============

function Statistics() {
  const [hoveredBar, setHoveredBar] = useState(null)

  const maxOrderValue = Math.max(...WEEKLY_ORDERS.map(o => o.value))

  // Donut chart calculations
  const total = STOCK_DISTRIBUTION.reduce((sum, s) => sum + s.value, 0)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  let cumulativePercent = 0

  const donutSegments = STOCK_DISTRIBUTION.map((segment) => {
    const percent = segment.value / total
    const strokeDasharray = `${percent * circumference} ${circumference}`
    const strokeDashoffset = -cumulativePercent * circumference
    cumulativePercent += percent
    return { ...segment, strokeDasharray, strokeDashoffset, percent }
  })

  return (
    <div className="stats-container">
      {/* Header */}
      <header className="stats-header">
        <div className="header-left">
          <div className="header-info">
            <h1 className="page-title">Estadísticas</h1>
            <div className="breadcrumb-row">
              <span className="breadcrumb-item">Dashboard</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.64795 6.39746L4.89795 10.1475C4.79228 10.2531 4.64895 10.3125 4.49951 10.3125C4.35007 10.3125 4.20675 10.2531 4.10107 10.1475C3.9954 10.0418 3.93604 9.89847 3.93604 9.74902C3.93604 9.59958 3.9954 9.45626 4.10107 9.35058L7.4531 5.99949L4.10201 2.64746C4.04969 2.59514 4.00818 2.53302 3.97986 2.46466C3.95155 2.39629 3.93697 2.32302 3.93697 2.24902C3.93697 2.17503 3.95155 2.10175 3.97986 2.03339C4.00818 1.96503 4.04969 1.90291 4.10201 1.85059C4.15433 1.79826 4.21645 1.75676 4.28482 1.72844C4.35318 1.70012 4.42645 1.68555 4.50045 1.68555C4.57445 1.68555 4.64772 1.70012 4.71608 1.72844C4.78445 1.75676 4.84656 1.79826 4.89889 1.85059L8.64889 5.60058C8.70126 5.6529 8.7428 5.71505 8.77111 5.78346C8.79942 5.85186 8.81395 5.92518 8.81386 5.99922C8.81377 6.07325 8.79907 6.14654 8.7706 6.21488C8.74213 6.28322 8.70045 6.34526 8.64795 6.39746Z" fill="#8B95A5"/>
              </svg>
              <span className="breadcrumb-active">Estadísticas</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="stats-period-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2.5H11.5V2C11.5 1.86739 11.4473 1.74021 11.3536 1.64645C11.2598 1.55268 11.1326 1.5 11 1.5C10.8674 1.5 10.7402 1.55268 10.6464 1.64645C10.5527 1.74021 10.5 1.86739 10.5 2V2.5H5.5V2C5.5 1.86739 5.44732 1.74021 5.35355 1.64645C5.25979 1.55268 5.13261 1.5 5 1.5C4.86739 1.5 4.74021 1.55268 4.64645 1.64645C4.55268 1.74021 4.5 1.86739 4.5 2V2.5H3C2.73478 2.5 2.48043 2.60536 2.29289 2.79289C2.10536 2.98043 2 3.23478 2 3.5V13C2 13.2652 2.10536 13.5196 2.29289 13.7071C2.48043 13.8946 2.73478 14 3 14H13C13.2652 14 13.5196 13.8946 13.7071 13.7071C13.8946 13.5196 14 13.2652 14 13V3.5C14 3.23478 13.8946 2.98043 13.7071 2.79289C13.5196 2.60536 13.2652 2.5 13 2.5ZM13 13H3V6H13V13Z" fill="#64748B"/>
            </svg>
            <span>Marzo 2026</span>
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
      <div className="stats-content">
        {/* KPI Cards */}
        <div className="stats-kpi-grid">
          {KPI_DATA.map((kpi, index) => (
            <div key={index} className="stats-kpi-card">
              <div className="kpi-info">
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-value">{kpi.value}</span>
                <div className="kpi-change-row">
                  <span className={`kpi-change ${kpi.changeType}`}>{kpi.change}</span>
                  <span className="kpi-period">{kpi.period}</span>
                </div>
              </div>
              <div className={`kpi-icon-box ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="stats-charts-row">
          {/* Bar Chart - Orders per Day */}
          <div className="stats-chart-card stats-bar-chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Órdenes por Día</h2>
              <span className="chart-subtitle">Última semana</span>
            </div>
            <div className="bar-chart-container">
              <div className="bar-chart-y-axis">
                {[300, 225, 150, 75, 0].map((val) => (
                  <span key={val} className="y-axis-label">{val}</span>
                ))}
              </div>
              <div className="bar-chart-bars">
                {WEEKLY_ORDERS.map((order, index) => {
                  const barHeight = (order.value / 300) * 100
                  return (
                    <div
                      key={index}
                      className="bar-column"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {hoveredBar === index && (
                        <div className="bar-tooltip">
                          <span className="tooltip-day">{order.fullDay}</span>
                          <span className="tooltip-value">{order.value} órdenes</span>
                        </div>
                      )}
                      <div className="bar-track">
                        <div
                          className={`bar-fill ${hoveredBar === index ? 'hovered' : ''}`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span className="bar-label">{order.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Donut Chart - Stock Distribution */}
          <div className="stats-chart-card stats-donut-chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Distribución de Stock</h2>
              <span className="chart-subtitle">Por estado actual</span>
            </div>
            <div className="donut-chart-container">
              <div className="donut-svg-wrapper">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  {donutSegments.map((segment, index) => (
                    <circle
                      key={index}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="28"
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      transform="rotate(-90 100 100)"
                      className="donut-segment"
                    />
                  ))}
                  <text x="100" y="94" textAnchor="middle" className="donut-center-value">2,340</text>
                  <text x="100" y="114" textAnchor="middle" className="donut-center-label">productos</text>
                </svg>
              </div>
              <div className="donut-legend">
                {STOCK_DISTRIBUTION.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-color" style={{ background: item.color }} />
                    <div className="legend-text">
                      <span className="legend-label">{item.label}</span>
                      <span className="legend-value">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Tables */}
        <div className="stats-tables-row">
          {/* Operators Performance */}
          <div className="stats-table-card">
            <div className="table-card-header">
              <h2 className="chart-title">Rendimiento de Operarios</h2>
              <span className="chart-subtitle">Top 5 del mes</span>
            </div>
            <div className="stats-table">
              <div className="stats-table-head">
                <span className="col-rank">#</span>
                <span className="col-name">Operario</span>
                <span className="col-orders">Órdenes</span>
                <span className="col-time">Tiempo Prom.</span>
                <span className="col-efficiency">Eficiencia</span>
              </div>
              <div className="stats-table-body">
                {OPERATORS_DATA.map((op, index) => (
                  <div key={index} className="stats-table-row">
                    <span className="col-rank">
                      <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                    </span>
                    <span className="col-name">
                      <div className="operator-avatar-sm">{op.name.charAt(0)}</div>
                      {op.name}
                    </span>
                    <span className="col-orders">{op.ordenes}</span>
                    <span className="col-time">{op.tiempoPromedio}</span>
                    <span className="col-efficiency">
                      <div className="efficiency-bar-wrapper">
                        <div className="efficiency-bar">
                          <div
                            className="efficiency-fill"
                            style={{
                              width: `${op.eficiencia}%`,
                              background: op.eficiencia >= 90 ? '#22C55E' : op.eficiencia >= 80 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="efficiency-text">{op.eficiencia}%</span>
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="stats-table-card">
            <div className="table-card-header">
              <h2 className="chart-title">Top Productos Más Movidos</h2>
              <span className="chart-subtitle">Por movimientos totales</span>
            </div>
            <div className="stats-table">
              <div className="stats-table-head">
                <span className="col-sku">SKU</span>
                <span className="col-product">Producto</span>
                <span className="col-movements">Movimientos</span>
                <span className="col-stock">Stock</span>
                <span className="col-trend">Tendencia</span>
              </div>
              <div className="stats-table-body">
                {TOP_PRODUCTS.map((product, index) => (
                  <div key={index} className="stats-table-row">
                    <span className="col-sku">
                      <code className="sku-code">{product.sku}</code>
                    </span>
                    <span className="col-product">{product.nombre}</span>
                    <span className="col-movements">
                      <strong>{product.movimientos}</strong>
                    </span>
                    <span className="col-stock">
                      <span className={`stock-badge ${product.stock < 50 ? 'low' : product.stock < 100 ? 'medium' : 'good'}`}>
                        {product.stock}
                      </span>
                    </span>
                    <span className="col-trend">
                      {product.tendencia === 'up' ? (
                        <span className="trend-up">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12L8 4L12 12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Subiendo
                        </span>
                      ) : (
                        <span className="trend-down">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L8 12L12 4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Bajando
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
