/**
 * Funciones auxiliares compartidas para órdenes
 * Usadas en App.jsx y OrderDetails.jsx
 */

export const getPriorityClass = (prioridad) => {
  const priorities = {
    'HIGH': 'high',
    'URGENT': 'high',
    'NORMAL': 'medium',
    'LOW': 'low'
  }
  return priorities[prioridad] || 'medium'
}

export const getPriorityLabel = (prioridad) => {
  const labels = {
    'HIGH': 'ALTA',
    'URGENT': 'URGENTE',
    'NORMAL': 'MEDIA',
    'LOW': 'BAJA'
  }
  return labels[prioridad] || prioridad
}

export const getPriorityLabelDetailed = (prioridad) => {
  const labels = {
    'HIGH': 'ALTA PRIORIDAD',
    'URGENT': 'URGENTE',
    'NORMAL': 'PRIORIDAD MEDIA',
    'LOW': 'PRIORIDAD BAJA'
  }
  return labels[prioridad] || prioridad
}

export const getStatusClass = (estadoCodigo) => {
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

export const formatDate = (dateString) => {
  if (!dateString || dateString === 'Sin fecha límite') return dateString
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatDateDetailed = (dateString) => {
  if (!dateString || dateString === 'Sin fecha límite') return dateString
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const hasOperatorAssigned = (operarioAsignado) => {
  if (!operarioAsignado || operarioAsignado.trim() === '') return false
  const lowerValue = operarioAsignado.toLowerCase().trim()
  const noAssignedTexts = ['sin operario', 'sin asignar', 'no asignado', 'null', 'undefined']
  return !noAssignedTexts.includes(lowerValue)
}
