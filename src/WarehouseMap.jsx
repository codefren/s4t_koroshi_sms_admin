import { useState, useCallback, useRef } from 'react'
import './WarehouseMap.css'

const PASILLOS = 11
const UBICACIONES = 100
const CELL_H = 14

function WarehouseMap() {
  const [tooltip, setTooltip] = useState(null)
  const rafRef = useRef(null)

  const getCellFromMouse = useCallback((e, pasillo, lado) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const row = Math.min(UBICACIONES, Math.max(1, Math.floor(y / CELL_H) + 1))
    const code = `P${pasillo}-${lado}-${String(row).padStart(3, '0')}`
    return { row, code, x: e.clientX, y: e.clientY }
  }, [])

  const handleRackMove = useCallback((e, pasillo, lado) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const { row, code, x, y } = getCellFromMouse(e, pasillo, lado)
      setTooltip({
        x, y: y - 10,
        text: code,
        detail: `Pasillo ${pasillo} · ${lado === 'I' ? 'Izquierda' : 'Derecha'} · Ubicación ${row}`
      })
    })
  }, [getCellFromMouse])

  const handleRackLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setTooltip(null)
  }, [])

  return (
    <div className="wm-container">
      <div className="wm-topbar">
        <div>
          <h1 className="wm-title">Mapa del Almacén</h1>
          <p className="wm-subtitle">{PASILLOS} pasillos · {UBICACIONES} ubicaciones/lado · {PASILLOS * UBICACIONES * 2} total</p>
        </div>
        <div className="wm-legend">
          <div className="wm-legend-item"><div className="wm-lg-rack wm-lg-left"></div><span>Rack Izq (I)</span></div>
          <div className="wm-legend-item"><div className="wm-lg-rack wm-lg-right"></div><span>Rack Der (D)</span></div>
          <div className="wm-legend-item"><div className="wm-lg-aisle"></div><span>Pasillo</span></div>
        </div>
      </div>

      <div className="wm-floor">
        <div className="wm-walls">
          <div className="wm-zone">
            <div className="wm-zone-gate">ENTRADA</div>
          </div>

          <div className="wm-scroll-area">
            {/* Row ruler left */}
            <div className="wm-ruler-v">
              {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => (
                <div key={n} className="wm-ruler-mark" style={{ top: (n - 1) * CELL_H }}>{n}</div>
              ))}
            </div>

            {/* All aisles */}
            <div className="wm-aisles">
              {Array.from({ length: PASILLOS }, (_, i) => i + 1).map(p => (
                <div key={p} className="wm-aisle-unit">
                  <div className="wm-pasillo-tag">P{p}</div>
                  <div className="wm-rack-row">
                    <div
                      className="wm-rack wm-rack-l"
                      style={{ height: UBICACIONES * CELL_H }}
                      onMouseMove={(e) => handleRackMove(e, p, 'I')}
                      onMouseLeave={handleRackLeave}
                    />
                    <div className="wm-walkway" style={{ height: UBICACIONES * CELL_H }}>
                      <span className="wm-walkway-num">{p}</span>
                    </div>
                    <div
                      className="wm-rack wm-rack-r"
                      style={{ height: UBICACIONES * CELL_H }}
                      onMouseMove={(e) => handleRackMove(e, p, 'D')}
                      onMouseLeave={handleRackLeave}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wm-zone wm-zone-bottom">
            <div className="wm-zone-gate">SALIDA / DESPACHO</div>
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="wm-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <strong>{tooltip.text}</strong>
          <span>{tooltip.detail}</span>
        </div>
      )}
    </div>
  )
}

export default WarehouseMap
