import { useState, useEffect } from 'react'
import './OrderDetails.css'

function OrderDetails({ onBack, orderId }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [operators, setOperators] = useState([])
  const [selectedOperator, setSelectedOperator] = useState('')
  const [loadingOperators, setLoadingOperators] = useState(false)
  const [assigningOperator, setAssigningOperator] = useState(false)
  const [assignError, setAssignError] = useState(null)
  const [assignSuccess, setAssignSuccess] = useState(false)

  // Funciones auxiliares
  const hasOperatorAssigned = (operarioAsignado) => {
    if (!operarioAsignado || operarioAsignado.trim() === '') return false
    const lowerValue = operarioAsignado.toLowerCase().trim()
    const noAssignedTexts = ['sin operario', 'sin asignar', 'no asignado', 'null', 'undefined']
    return !noAssignedTexts.includes(lowerValue)
  }

  const getPriorityClass = (prioridad) => {
    const priorities = {
      'HIGH': 'high',
      'URGENT': 'high',
      'NORMAL': 'medium',
      'LOW': 'low'
    }
    return priorities[prioridad] || 'medium'
  }

  const getPriorityLabel = (prioridad) => {
    const labels = {
      'HIGH': 'ALTA PRIORIDAD',
      'URGENT': 'URGENTE',
      'NORMAL': 'PRIORIDAD MEDIA',
      'LOW': 'PRIORIDAD BAJA'
    }
    return labels[prioridad] || prioridad
  }

  const getStatusClass = (estadoCodigo) => {
    const statuses = {
      'PENDING': 'pending',
      'ASSIGNED': 'assigned',
      'IN_PICKING': 'in-progress',
      'PICKED': 'picked',
      'PACKING': 'packing',
      'READY': 'ready',
      'SHIPPED': 'completed',
      'CANCELLED': 'cancelled'
    }
    return statuses[estadoCodigo] || 'pending'
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Sin fecha límite') return dateString
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Cargar detalle de orden desde la API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })
        if (!response.ok) {
          throw new Error(`Error al cargar el detalle de la orden: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err.message)
        console.error('Error completo:', err)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // Cargar operarios activos desde la API
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setLoadingOperators(true)
        const response = await fetch('http://localhost:8000/api/v1/operators?activo=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })
        if (!response.ok) {
          throw new Error(`Error al cargar operarios: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setOperators(data)
      } catch (err) {
        console.error('Error al cargar operarios:', err)
      } finally {
        setLoadingOperators(false)
      }
    }

    fetchOperators()
  }, [])

  // Preseleccionar operario si la orden ya tiene uno asignado
  useEffect(() => {
    if (order && operators.length > 0 && hasOperatorAssigned(order.operario_asignado)) {
      // Buscar el operario en la lista por nombre
      const assignedOperator = operators.find(
        op => op.nombre === order.operario_asignado
      )
      if (assignedOperator) {
        setSelectedOperator(assignedOperator.id.toString())
      }
    }
  }, [order, operators])

  // Función para asignar operario a la orden
  const handleAssignOperator = async () => {
    if (!selectedOperator) return

    try {
      setAssigningOperator(true)
      setAssignError(null)
      setAssignSuccess(false)

      const response = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/assign-operator/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          operator_id: parseInt(selectedOperator)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error al asignar operario: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Actualizar la orden con los nuevos datos
      setOrder(data)
      setAssignSuccess(true)
      setSelectedOperator('')

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setAssignSuccess(false)
      }, 3000)

    } catch (err) {
      setAssignError(err.message)
      console.error('Error al asignar operario:', err)
    } finally {
      setAssigningOperator(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
          Cargando detalles de la orden...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
          Error: {error}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="dashboard">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
          No se encontró la orden
        </div>
      </div>
    )
  }
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <svg className="logo-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.2" d="M24 24.2038V43.4995C23.7481 43.4984 23.5004 43.4339 23.28 43.312L6.78 34.2782C6.5444 34.1493 6.34772 33.9595 6.21052 33.7286C6.07331 33.4977 6.00061 33.2343 6 32.9657V15.0332C6.0006 14.8231 6.04531 14.6155 6.13125 14.4238L24 24.2038Z" fill="#3B82F6"/>
            <path d="M41.94 12.4034L25.44 3.37528C24.9991 3.13168 24.5037 3.00391 24 3.00391C23.4963 3.00391 23.0009 3.13168 22.56 3.37528L6.06 12.4072C5.58879 12.665 5.19544 13.0446 4.92103 13.5063C4.64663 13.9681 4.50122 14.495 4.5 15.0322V32.9647C4.50122 33.5018 4.64663 34.0287 4.92103 34.4905C5.19544 34.9522 5.58879 35.3318 6.06 35.5897L22.56 44.6215C23.0009 44.8651 23.4963 44.9929 24 44.9929C24.5037 44.9929 24.9991 44.8651 25.44 44.6215L41.94 35.5897C42.4112 35.3318 42.8046 34.9522 43.079 34.4905C43.3534 34.0287 43.4988 33.5018 43.5 32.9647V15.034C43.4998 14.4959 43.3549 13.9678 43.0804 13.505C42.8059 13.0422 42.412 12.6617 41.94 12.4034ZM24 6.00028L39.0638 14.2503L33.4819 17.3065L18.4163 9.05653L24 6.00028ZM24 22.5003L8.93625 14.2503L15.2925 10.7703L30.3562 19.0203L24 22.5003ZM7.5 16.8753L22.5 25.084V41.1697L7.5 32.9665V16.8753ZM40.5 32.959L25.5 41.1697V25.0915L31.5 21.8084V28.5003C31.5 28.8981 31.658 29.2796 31.9393 29.5609C32.2206 29.8422 32.6022 30.0003 33 30.0003C33.3978 30.0003 33.7794 29.8422 34.0607 29.5609C34.342 29.2796 34.5 28.8981 34.5 28.5003V20.1659L40.5 16.8753V32.9572V32.959Z" fill="#3B82F6"/>
          </svg>
          <div className="logo-text">WMS Pro</div>
        </div>

        <nav className="nav-menu">
          <button className="nav-item active">
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.75 2.99986H15.3506C14.9292 2.52804 14.4129 2.15054 13.8355 1.89207C13.2581 1.63361 12.6326 1.5 12 1.5C11.3674 1.5 10.7419 1.63361 10.1645 1.89207C9.58709 2.15054 9.07079 2.52804 8.64937 2.99986H5.25C4.85218 2.99986 4.47064 3.1579 4.18934 3.4392C3.90804 3.72051 3.75 4.10204 3.75 4.49986V20.2499C3.75 20.6477 3.90804 21.0292 4.18934 21.3105C4.47064 21.5918 4.85218 21.7499 5.25 21.7499H18.75C19.1478 21.7499 19.5294 21.5918 19.8107 21.3105C20.092 21.0292 20.25 20.6477 20.25 20.2499V4.49986C20.25 4.10204 20.092 3.72051 19.8107 3.4392C19.5294 3.1579 19.1478 2.99986 18.75 2.99986ZM12 2.99986C12.7956 2.99986 13.5587 3.31593 14.1213 3.87854C14.6839 4.44115 15 5.20421 15 5.99986H9C9 5.20421 9.31607 4.44115 9.87868 3.87854C10.4413 3.31593 11.2044 2.99986 12 2.99986ZM15 14.9999H9C8.80109 14.9999 8.61032 14.9208 8.46967 14.7802C8.32902 14.6395 8.25 14.4488 8.25 14.2499C8.25 14.051 8.32902 13.8602 8.46967 13.7195C8.61032 13.5789 8.80109 13.4999 9 13.4999H15C15.1989 13.4999 15.3897 13.5789 15.5303 13.7195C15.671 13.8602 15.75 14.051 15.75 14.2499C15.75 14.4488 15.671 14.6395 15.5303 14.7802C15.3897 14.9208 15.1989 14.9999 15 14.9999ZM15 11.9999H9C8.80109 11.9999 8.61032 11.9208 8.46967 11.7802C8.32902 11.6395 8.25 11.4488 8.25 11.2499C8.25 11.051 8.32902 10.8602 8.46967 10.7195C8.61032 10.5789 8.80109 10.4999 9 10.4999H15C15.1989 10.4999 15.3897 10.5789 15.5303 10.7195C15.671 10.8602 15.75 11.051 15.75 11.2499C15.75 11.4488 15.671 11.6395 15.5303 11.7802C15.3897 11.9208 15.1989 11.9999 15 11.9999Z" fill="white"/>
            </svg>
            <span className="nav-text">Órdenes</span>
          </button>

          <button className="nav-item">
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.9922 14.8053C11.9974 14.1361 12.7606 13.1612 13.1688 12.0248C13.5771 10.8883 13.6088 9.65061 13.2592 8.49474C12.9096 7.33887 12.1974 6.32618 11.2278 5.60642C10.2581 4.88666 9.08262 4.49805 7.87505 4.49805C6.66747 4.49805 5.49196 4.88666 4.52233 5.60642C3.55271 6.32618 2.84045 7.33887 2.49088 8.49474C2.14132 9.65061 2.17301 10.8883 2.58126 12.0248C2.98952 13.1612 3.75267 14.1361 4.75786 14.8053C2.93957 15.4755 1.38671 16.7156 0.330984 18.3406C0.275499 18.4231 0.236959 18.5158 0.217604 18.6133C0.198249 18.7108 0.198466 18.8111 0.218241 18.9085C0.238017 19.0059 0.276957 19.0984 0.332798 19.1807C0.388639 19.2629 0.460266 19.3332 0.543518 19.3875C0.626769 19.4418 0.719983 19.479 0.817742 19.497C0.9155 19.5149 1.01585 19.5133 1.11297 19.4921C1.21008 19.4709 1.30202 19.4307 1.38344 19.3737C1.46486 19.3167 1.53413 19.244 1.58723 19.16C2.26822 18.1126 3.20007 17.2519 4.29814 16.6561C5.39622 16.0603 6.62574 15.7482 7.87505 15.7482C9.12436 15.7482 10.3539 16.0603 11.452 16.6561C12.55 17.2519 13.4819 18.1126 14.1629 19.16C14.2729 19.3235 14.4428 19.4371 14.6359 19.4763C14.829 19.5156 15.0298 19.4772 15.1949 19.3695C15.3599 19.2619 15.476 19.0936 15.5179 18.9011C15.5599 18.7085 15.5244 18.5072 15.4191 18.3406C14.3634 16.7156 12.8105 15.4755 10.9922 14.8053ZM3.75005 10.1253C3.75005 9.30948 3.99197 8.51195 4.44523 7.8336C4.8985 7.15525 5.54273 6.62654 6.29648 6.31433C7.05022 6.00212 7.87962 5.92043 8.67979 6.07959C9.47997 6.23875 10.215 6.63162 10.7919 7.20851C11.3688 7.78541 11.7616 8.52041 11.9208 9.32058C12.0799 10.1208 11.9983 10.9502 11.686 11.7039C11.3738 12.4576 10.8451 13.1019 10.1668 13.5551C9.48842 14.0084 8.69089 14.2503 7.87505 14.2503C6.78141 14.2491 5.73292 13.8141 4.9596 13.0408C4.18628 12.2675 3.75129 11.219 3.75005 10.1253ZM23.4507 19.3785C23.2841 19.4871 23.0812 19.5251 22.8865 19.4841C22.6919 19.4432 22.5215 19.3266 22.4129 19.16C21.7327 18.112 20.801 17.2509 19.7027 16.6554C18.6044 16.0598 17.3744 15.7487 16.125 15.7503C15.9261 15.7503 15.7354 15.6713 15.5947 15.5307C15.4541 15.39 15.375 15.1992 15.375 15.0003C15.375 14.8014 15.4541 14.6107 15.5947 14.47C15.7354 14.3293 15.9261 14.2503 16.125 14.2503C16.7325 14.2498 17.3324 14.115 17.8817 13.8557C18.4311 13.5965 18.9164 13.2191 19.303 12.7505C19.6896 12.2819 19.9679 11.7337 20.1181 11.1451C20.2683 10.5565 20.2866 9.94198 20.1718 9.34547C20.0569 8.74895 19.8117 8.18516 19.4537 7.69439C19.0958 7.20361 18.6338 6.79796 18.1008 6.50642C17.5679 6.21488 16.9771 6.04465 16.3708 6.00789C15.7644 5.97113 15.1574 6.06875 14.5932 6.29377C14.5012 6.33354 14.4021 6.35447 14.3019 6.35531C14.2017 6.35616 14.1023 6.33691 14.0096 6.2987C13.917 6.26049 13.8329 6.20409 13.7624 6.13284C13.6919 6.0616 13.6364 5.97694 13.5992 5.88388C13.562 5.79082 13.5438 5.69124 13.5457 5.59103C13.5476 5.49082 13.5696 5.39201 13.6103 5.30044C13.6511 5.20887 13.7098 5.12639 13.7829 5.05788C13.8561 4.98938 13.9422 4.93623 14.0363 4.90158C15.3277 4.38656 16.764 4.36803 18.0682 4.84955C19.3725 5.33108 20.4522 6.27854 21.099 7.50916C21.7459 8.73978 21.9141 10.1664 21.5713 11.5137C21.2284 12.861 20.3987 14.0336 19.2422 14.8053C21.0605 15.4755 22.6134 16.7156 23.6691 18.3406C23.7777 18.5072 23.8158 18.7102 23.7748 18.9048C23.7338 19.0994 23.6172 19.2698 23.4507 19.3785Z" fill="#94A3B8"/>
            </svg>
            <span className="nav-text">Operarios</span>
          </button>

          <button className="nav-item">
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 18.75H20.25V3.75C20.25 3.55109 20.171 3.36032 20.0303 3.21967C19.8897 3.07902 19.6989 3 19.5 3H14.25C14.0511 3 13.8603 3.07902 13.7197 3.21967C13.579 3.36032 13.5 3.55109 13.5 3.75V7.5H9C8.80109 7.5 8.61032 7.57902 8.46967 7.71967C8.32902 7.86032 8.25 8.05109 8.25 8.25V12H4.5C4.30109 12 4.11032 12.079 3.96967 12.2197C3.82902 12.3603 3.75 12.5511 3.75 12.75V18.75H3C2.80109 18.75 2.61032 18.829 2.46967 18.9697C2.32902 19.1103 2.25 19.3011 2.25 19.5C2.25 19.6989 2.32902 19.8897 2.46967 20.0303C2.61032 20.171 2.80109 20.25 3 20.25H21C21.1989 20.25 21.3897 20.171 21.5303 20.0303C21.671 19.8897 21.75 19.6989 21.75 19.5C21.75 19.3011 21.671 19.1103 21.5303 18.9697C21.3897 18.829 21.1989 18.75 21 18.75ZM15 4.5H18.75V18.75H15V4.5ZM9.75 9H13.5V18.75H9.75V9ZM5.25 13.5H8.25V18.75H5.25V13.5Z" fill="#94A3B8"/>
            </svg>
            <span className="nav-text">Estadísticas</span>
          </button>

          <button className="nav-item">
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 7.49956C11.11 7.49956 10.24 7.76348 9.49998 8.25794C8.75996 8.75241 8.18318 9.45521 7.84259 10.2775C7.50199 11.0997 7.41288 12.0045 7.58651 12.8775C7.76014 13.7504 8.18873 14.5522 8.81806 15.1815C9.4474 15.8109 10.2492 16.2395 11.1221 16.4131C11.9951 16.5867 12.8999 16.4976 13.7221 16.157C14.5444 15.8164 15.2472 15.2396 15.7417 14.4996C16.2361 13.7596 16.5 12.8896 16.5 11.9996C16.4988 10.8065 16.0243 9.66259 15.1807 8.81895C14.337 7.9753 13.1931 7.5008 12 7.49956ZM12 14.9996C11.4067 14.9996 10.8267 14.8236 10.3333 14.494C9.83999 14.1643 9.45547 13.6958 9.2284 13.1476C9.00134 12.5994 8.94193 11.9962 9.05769 11.4143C9.17344 10.8323 9.45917 10.2978 9.87872 9.87823C10.2983 9.45868 10.8328 9.17295 11.4148 9.0572C11.9967 8.94144 12.5999 9.00085 13.1481 9.22792C13.6963 9.45498 14.1648 9.8395 14.4945 10.3328C14.8241 10.8262 15 11.4062 15 11.9996C15 12.7952 14.684 13.5583 14.1214 14.1209C13.5588 14.6835 12.7957 14.9996 12 14.9996ZM20.25 12.2021C20.2538 12.0671 20.2538 11.9321 20.25 11.7971L21.6488 10.0496C21.7221 9.9578 21.7729 9.85011 21.797 9.73514C21.8211 9.62018 21.8179 9.50116 21.7875 9.38768C21.5582 8.52574 21.2152 7.69816 20.7675 6.92674C20.7089 6.82579 20.6276 6.73992 20.5299 6.67595C20.4322 6.61199 20.321 6.5717 20.205 6.5583L17.9813 6.3108C17.8888 6.2133 17.795 6.11955 17.7 6.02955L17.4375 3.80018C17.424 3.68413 17.3836 3.57284 17.3195 3.47518C17.2554 3.37752 17.1693 3.29619 17.0682 3.23768C16.2965 2.79082 15.4689 2.44815 14.6072 2.21862C14.4937 2.18843 14.3746 2.18534 14.2597 2.2096C14.1447 2.23387 14.037 2.2848 13.9454 2.3583L12.2025 3.74955C12.0675 3.74955 11.9325 3.74955 11.7975 3.74955L10.05 2.35362C9.95829 2.28027 9.8506 2.22951 9.73563 2.20541C9.62067 2.18131 9.50165 2.18455 9.38817 2.21487C8.52637 2.44458 7.69884 2.78757 6.92723 3.23487C6.82628 3.29349 6.7404 3.37486 6.67644 3.47251C6.61248 3.57017 6.57219 3.6814 6.55879 3.79737L6.31129 6.02487C6.21379 6.11799 6.12004 6.21174 6.03004 6.30612L3.80067 6.56206C3.68462 6.57556 3.57333 6.61598 3.47567 6.68011C3.37801 6.74424 3.29668 6.8303 3.23817 6.93143C2.79131 7.70315 2.44864 8.53066 2.21911 9.39237C2.18891 9.50592 2.18583 9.62498 2.21009 9.73995C2.23435 9.85491 2.28529 9.96257 2.35879 10.0542L3.75004 11.7971C3.75004 11.9321 3.75004 12.0671 3.75004 12.2021L2.35411 13.9496C2.28076 14.0413 2.23 14.149 2.2059 14.264C2.1818 14.3789 2.18504 14.4979 2.21536 14.6114C2.44466 15.4734 2.78767 16.3009 3.23536 17.0724C3.29397 17.1733 3.37535 17.2592 3.473 17.3232C3.57065 17.3871 3.68189 17.4274 3.79786 17.4408L6.02161 17.6883C6.11473 17.7858 6.20848 17.8796 6.30286 17.9696L6.56254 20.1989C6.57605 20.315 6.61647 20.4263 6.6806 20.5239C6.74473 20.6216 6.83079 20.7029 6.93192 20.7614C7.70363 21.2083 8.53114 21.551 9.39286 21.7805C9.50641 21.8107 9.62547 21.8138 9.74044 21.7895C9.8554 21.7652 9.96306 21.7143 10.0547 21.6408L11.7975 20.2496C11.9325 20.2533 12.0675 20.2533 12.2025 20.2496L13.95 21.6483C14.0418 21.7216 14.1495 21.7724 14.2645 21.7965C14.3794 21.8206 14.4984 21.8174 14.6119 21.7871C15.4739 21.5578 16.3014 21.2147 17.0729 20.7671C17.1738 20.7084 17.2597 20.6271 17.3236 20.5294C17.3876 20.4318 17.4279 20.3205 17.4413 20.2046L17.6888 17.9808C17.7863 17.8883 17.88 17.7946 17.97 17.6996L20.1994 17.4371C20.3155 17.4236 20.4268 17.3831 20.5244 17.319C20.6221 17.2549 20.7034 17.1688 20.7619 17.0677C21.2088 16.296 21.5515 15.4685 21.781 14.6067C21.8112 14.4932 21.8143 14.3741 21.79 14.2592C21.7657 14.1442 21.7148 14.0365 21.6413 13.9449L20.25 12.2021ZM18.7407 11.5927C18.7566 11.8637 18.7566 12.1354 18.7407 12.4064C18.7295 12.592 18.7876 12.7751 18.9038 12.9202L20.2341 14.5824C20.0815 15.0675 19.886 15.5381 19.65 15.9886L17.5313 16.2286C17.3468 16.2491 17.1764 16.3373 17.0532 16.4761C16.8727 16.6791 16.6805 16.8713 16.4775 17.0517C16.3387 17.175 16.2505 17.3454 16.23 17.5299L15.9947 19.6467C15.5443 19.8828 15.0736 20.0783 14.5885 20.2308L12.9254 18.9005C12.7923 18.7942 12.627 18.7363 12.4566 18.7364H12.4116C12.1406 18.7524 11.8689 18.7524 11.5979 18.7364C11.4123 18.7253 11.2292 18.7834 11.0841 18.8996L9.41723 20.2308C8.93211 20.0782 8.4615 19.8827 8.01098 19.6467L7.77098 17.5308C7.7505 17.3463 7.66231 17.1759 7.52348 17.0527C7.32052 16.8722 7.12832 16.68 6.94786 16.4771C6.82461 16.3382 6.65424 16.25 6.46973 16.2296L4.35286 15.9933C4.11679 15.5428 3.92132 15.0722 3.76879 14.5871L5.09911 12.9239C5.21527 12.7788 5.2734 12.5957 5.26223 12.4102C5.24629 12.1392 5.24629 11.8674 5.26223 11.5964C5.2734 11.4109 5.21527 11.2278 5.09911 11.0827L3.76879 9.41674C3.92144 8.93162 4.1169 8.46102 4.35286 8.01049L6.46879 7.77049C6.65331 7.75001 6.82367 7.66182 6.94692 7.52299C7.12738 7.32003 7.31958 7.12783 7.52254 6.94737C7.66193 6.82404 7.75048 6.65329 7.77098 6.46831L8.00629 4.35237C8.45677 4.1163 8.92738 3.92084 9.41254 3.7683L11.0757 5.09862C11.2208 5.21478 11.4039 5.27291 11.5894 5.26174C11.8604 5.24581 12.1322 5.24581 12.4032 5.26174C12.5887 5.27291 12.7718 5.21478 12.9169 5.09862L14.5829 3.7683C15.068 3.92095 15.5386 4.11641 15.9891 4.35237L16.2291 6.46831C16.2496 6.65282 16.3378 6.82318 16.4766 6.94643C16.6796 7.12689 16.8718 7.31909 17.0522 7.52205C17.1755 7.66089 17.3458 7.74907 17.5304 7.76955L19.6472 8.00487C19.8833 8.45534 20.0788 8.92595 20.2313 9.41112L18.901 11.0742C18.7837 11.2206 18.7255 11.4056 18.7379 11.5927H18.7407Z" fill="#94A3B8"/>
            </svg>
            <span className="nav-text">Configuración</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="details-header">
          <div className="header-left-section">
            <button className="back-button" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.375 11.9991C21.375 12.2974 21.2565 12.5836 21.0455 12.7946C20.8345 13.0055 20.5484 13.1241 20.25 13.1241H6.46878L11.2988 17.9531C11.5101 18.1645 11.6289 18.4511 11.6289 18.75C11.6289 19.0489 11.5101 19.3355 11.2988 19.5469C11.0874 19.7582 10.8008 19.877 10.5019 19.877C10.203 19.877 9.91638 19.7582 9.70503 19.5469L2.95503 12.7969C2.85015 12.6924 2.76694 12.5682 2.71016 12.4314C2.65337 12.2947 2.62415 12.1481 2.62415 12C2.62415 11.8519 2.65337 11.7053 2.71016 11.5686C2.76694 11.4318 2.85015 11.3076 2.95503 11.2031L9.70503 4.45312C9.80968 4.34848 9.93391 4.26547 10.0706 4.20883C10.2074 4.1522 10.3539 4.12305 10.5019 4.12305C10.6499 4.12305 10.7964 4.1522 10.9332 4.20883C11.0699 4.26547 11.1941 4.34848 11.2988 4.45312C11.4034 4.55777 11.4864 4.682 11.5431 4.81873C11.5997 4.95546 11.6289 5.102 11.6289 5.25C11.6289 5.39799 11.5997 5.54454 11.5431 5.68126C11.4864 5.81799 11.4034 5.94223 11.2988 6.04687L6.46878 10.8741H20.25C20.5484 10.8741 20.8345 10.9926 21.0455 11.2036C21.2565 11.4145 21.375 11.7007 21.375 11.9991Z" fill="#64748B"/>
              </svg>
            </button>
            <div className="header-title-section">
              <h1 className="order-title">Orden #{order.numero_orden}</h1>
              <p className="order-subtitle">Detalles completos de la orden</p>
            </div>
          </div>
          <div className="header-badges">
            <div className={`status-badge-header ${getStatusClass(order.estado_codigo)}`}>{order.estado.toUpperCase()}</div>
            <div className={`priority-badge-header ${getPriorityClass(order.prioridad)}`}>{getPriorityLabel(order.prioridad)}</div>
          </div>
        </header>

        {/* Details Content */}
        <div className="details-content">
          {/* Left Column */}
          <div className="details-left-column">
            {/* Order Information Card */}
            <div className="info-card">
              <h2 className="card-title">Información de la Orden</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Cliente</span>
                  <span className="info-value">{order.nombre_cliente}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de Creación</span>
                  <span className="info-value">{formatDate(order.fecha_creacion)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha Límite</span>
                  <span className="info-value">{order.fecha_limite}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total de Cajas</span>
                  <span className="info-value">{order.total_cajas}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Operario Asignado</span>
                  <span className="info-value">{hasOperatorAssigned(order.operario_asignado) ? order.operario_asignado : 'Sin asignar'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Progreso</span>
                  <span className="info-value">{order.items_completados} de {order.total_items} items ({order.progreso_porcentaje.toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="products-card">
              <div className="products-header">
                <h2 className="card-title">Lista de Productos</h2>
                <div className="items-count-badge">{order.total_items} items</div>
              </div>
              <div className="products-list">
                {order.productos.map((producto) => (
                <div className="product-item" key={producto.id}>
                  <div className="product-image-placeholder" style={{ width: '64px', height: '64px', backgroundColor: '#E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.25 6.375C20.25 8.65317 18.4032 10.5 16.125 10.5C13.8468 10.5 12 8.65317 12 6.375C12 4.09683 13.8468 2.25 16.125 2.25C18.4032 2.25 20.25 4.09683 20.25 6.375Z"/>
                      <path d="M3.75 19.125C3.75 14.7767 7.27673 11.25 11.625 11.25H12.375C16.7233 11.25 20.25 14.7767 20.25 19.125V21.75H3.75V19.125Z"/>
                    </svg>
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{producto.nombre} - {producto.descripcion}</h3>
                    <p className="product-sku">SKU: {producto.sku} | EAN: {producto.ean}</p>
                    <div className="product-specs">
                      <span className="product-spec">Ubicación: {producto.ubicacion}</span>
                      <span className="product-spec">Talla: {producto.talla}</span>
                      <span className="product-spec">Color: {producto.color}</span>
                      <span className={`product-spec ${producto.estado === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                        Estado: {producto.estado === 'COMPLETED' ? 'Completado' : 'Pendiente'} ({producto.cantidad_servida}/{producto.cantidad_solicitada})
                      </span>
                    </div>
                  </div>
                  <div className="product-quantity">{producto.cantidad_solicitada}</div>
                </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="details-right-column">
            {/* Assign Operator Card */}
            <div className="assign-card">
              <h2 className="assign-title">{hasOperatorAssigned(order.operario_asignado) ? 'Reasignar Operario' : 'Asignar Operario'}</h2>
              
              {hasOperatorAssigned(order.operario_asignado) && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #3B82F6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1E40AF'
                }}>
                  <strong>Operario actual:</strong> {order.operario_asignado}
                </div>
              )}
              
              <div className="operator-select-section">
                <label className="select-label">{hasOperatorAssigned(order.operario_asignado) ? 'Cambiar a otro operario' : 'Selecciona un operario disponible'}</label>
                <select 
                  className="operator-select"
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  disabled={loadingOperators || operators.length === 0}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    color: '#1E293B',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">
                    {loadingOperators ? 'Cargando operarios...' : 'Selecciona un operario'}
                  </option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.nombre} ({operator.codigo_operario})
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="assign-button"
                disabled={!selectedOperator || assigningOperator}
                onClick={handleAssignOperator}
                style={{
                  opacity: (!selectedOperator || assigningOperator) ? 0.5 : 1,
                  cursor: (!selectedOperator || assigningOperator) ? 'not-allowed' : 'pointer'
                }}
              >
                {assigningOperator ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="10" cy="10" r="8" stroke="#3B82F6" strokeWidth="2" strokeDasharray="12 8" fill="none" />
                    </svg>
                    <span className="assign-button-text">Asignando...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#3B82F6" strokeWidth="1.25"/>
                    </svg>
                    <span className="assign-button-text">{hasOperatorAssigned(order.operario_asignado) ? 'Reasignar Operario' : 'Asignar Orden'}</span>
                  </>
                )}
              </button>
              
              {/* Mensajes de feedback */}
              {assignSuccess && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#D1FAE5',
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  color: '#065F46',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>¡Operario {hasOperatorAssigned(order.operario_asignado) ? 'reasignado' : 'asignado'} correctamente!</span>
                </div>
              )}
              
              {assignError && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  color: '#991B1B',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{assignError}</span>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="summary-card">
              <h2 className="card-title">Resumen</h2>
              <div className="summary-items">
                <div className="summary-item">
                  <span className="summary-label">Total Items</span>
                  <span className="summary-value">{order.total_items}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Items Completados</span>
                  <span className="summary-value">{order.items_completados}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Progreso</span>
                  <span className="summary-value">{order.progreso_porcentaje.toFixed(1)}%</span>
                </div>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Productos Únicos</span>
                <span className="summary-total-value">{order.productos.length}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default OrderDetails
