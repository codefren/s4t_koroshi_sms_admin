import ProductTable from './components/ProductTable'
import { WAREHOUSE_IDS } from './config/api'

function Products() {
  return <ProductTable title="Almacén de Picking" almacenId={WAREHOUSE_IDS.PICKING} newButtonLabel="Nuevo Producto" />
}

export default Products
