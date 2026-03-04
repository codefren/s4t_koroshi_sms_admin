import ProductTable from './components/ProductTable'
import { WAREHOUSE_IDS } from './config/api'

function Almacen() {
  return <ProductTable title="Almacén de Reposición" almacenId={WAREHOUSE_IDS.REPLENISHMENT} newButtonLabel="Nuevo Producto" />
}

export default Almacen
