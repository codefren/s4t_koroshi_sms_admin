import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import OrdersView from './components/OrdersView'
const OrderDetails = lazy(() => import('./OrderDetails'))
const Products = lazy(() => import('./Products'))
const Almacen = lazy(() => import('./Almacen'))
const Operators = lazy(() => import('./Operators'))
const Replenishment = lazy(() => import('./Replenishment'))
const PackingDistribution = lazy(() => import('./PackingDistribution'))
const WarehouseMap = lazy(() => import('./WarehouseMap'))
import { orderService } from './services/orderService'

function App() {
  const [currentView, setCurrentView] = useState('orders') // 'orders', 'products', 'almacen', 'operators', or 'replenishment'
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showPackingDistribution, setShowPackingDistribution] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const abortControllerRef = useRef(null)

  // Función para actualizar la prioridad de una orden
  const updateOrderPriority = async (orderId, newPriority) => {
    try {
      const updatedOrder = await orderService.updatePriority(orderId, newPriority)
      
      // Actualizar la orden en el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, prioridad: updatedOrder.prioridad } : order
        )
      )

      return true
    } catch (err) {
      console.error('Error al actualizar prioridad:', err)
      return false
    }
  }

  // Función para cargar órdenes desde la API
  const fetchOrders = async (isAutoRefresh = false) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      // Solo mostrar loading en la carga inicial, no en refrescos automáticos
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      
      const data = await orderService.getAll(abortControllerRef.current.signal)
      setOrders(data)
      setLastUpdate(new Date())
      // Limpiar errores si la carga fue exitosa
      if (error) setError(null)
    } catch (err) {
      if (err.name === 'AbortError') return
      // Solo mostrar error en carga inicial
      if (!isAutoRefresh) {
        setError(err.message)
      }
      console.error('Error completo:', err)
    } finally {
      if (!isAutoRefresh) {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  // Cargar órdenes al montar el componente
  useEffect(() => {
    fetchOrders()
  }, [])

  // Actualización automática cada 3 segundos
  useEffect(() => {
    // Solo ejecutar polling cuando estemos en la vista del dashboard (no en detalle)
    if (showOrderDetails) return

    const interval = setInterval(() => {
      console.log('🔄 Actualizando órdenes automáticamente...')
      fetchOrders(true) // true = es un refresco automático
    }, 3000) // 3 segundos

    // Limpiar el intervalo cuando el componente se desmonte o cambie a detalle
    return () => {
      clearInterval(interval)
      console.log('⏹️ Polling detenido')
    }
  }, [showOrderDetails])

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId)
    setShowOrderDetails(true)
  }

  const handleViewPacking = (orderId) => {
    setSelectedOrderId(orderId)
    setShowPackingDistribution(true)
  }

  return (
    <div className="dashboard">
      <Sidebar currentView={currentView} onNavigate={(view) => {
        setShowOrderDetails(false)
        setShowPackingDistribution(false)
        setSelectedOrderId(null)
        setCurrentView(view)
      }} />

      {/* Main Content */}
      <main className="main-content">
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Cargando...</div>}>
        {showOrderDetails && selectedOrderId ? (
          <OrderDetails onBack={() => {
            setShowOrderDetails(false)
            setSelectedOrderId(null)
          }} orderId={selectedOrderId} />
        ) : showPackingDistribution ? (
          <PackingDistribution 
            orderId={selectedOrderId}
            onBack={() => {
              setShowPackingDistribution(false)
              setSelectedOrderId(null)
            }}
          />
        ) : currentView === 'products' ? (
          <Products onBack={() => setCurrentView('orders')} />
        ) : currentView === 'almacen' ? (
          <Almacen onBack={() => setCurrentView('orders')} />
        ) : currentView === 'warehouse-map' ? (
          <WarehouseMap />
        ) : currentView === 'operators' ? (
          <Operators />
        ) : currentView === 'replenishment' ? (
          <Replenishment onBack={() => setCurrentView('orders')} />
        ) : (
          <OrdersView
            orders={orders}
            loading={loading}
            error={error}
            lastUpdate={lastUpdate}
            isRefreshing={isRefreshing}
            onViewOrder={handleViewOrder}
            onViewPacking={handleViewPacking}
            onUpdatePriority={updateOrderPriority}
          />
        )}
        </Suspense>
      </main>
    </div>
  )
}

export default App
