import { FacturaRepository } from '../repositories/factura.repository';

export class FacturaService {
  constructor(private repository: FacturaRepository) { }

  /**
   * Obtiene el dashboard general con estadísticas del mes actual
   */
  async obtenerDashboardGeneral(): Promise<{
    mesActual: string;
    totalVentas: number;
    cantidadFacturas: number;
    promedioPorFactura: number;
    montoPendiente: number;
  }> {
    try {
      const hoy = new Date();
      const mesActual = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;

      // Obtener mes en formato DD-MM-YYYY (ej: "05-01-2026")
      const [dia, mes, año] = mesActual.split('-');
      const mesBusqueda = `${mes}-${año}`;

      const facturasMes = await this.repository.obtenerPorMes(mesBusqueda);

      const totalVentas = facturasMes.reduce((sum, f) => sum + f.total, 0);
      const cantidadFacturas = facturasMes.length;
      const promedioPorFactura = cantidadFacturas > 0 ? totalVentas / cantidadFacturas : 0;
      const montoPendiente = facturasMes.reduce((sum, f) => sum + f.importePendiente, 0);

      return {
        mesActual: `${mes}/${año}`,
        totalVentas: Math.round(totalVentas * 100) / 100,
        cantidadFacturas,
        promedioPorFactura: Math.round(promedioPorFactura * 100) / 100,
        montoPendiente: Math.round(montoPendiente * 100) / 100,
      };
    } catch (error) {
      console.error('Error en FacturaService.obtenerDashboardGeneral:', error);
      throw error;
    }
  }

  async obtenerVentasXProducto(): Promise<{
    producto: string;
    totalVentas: number;
    cantidadFacturas: number;
    montoPendiente: number;
  }[]> {
    try {
      const facturas = await this.repository.obtenerTodas();

      const map = new Map<
        string,
        { totalVentas: number; cantidadFacturas: number; montoPendiente: number }
      >();

      for (const f of facturas) {
        const key = f.producto || 'Sin producto';

        if (!map.has(key)) {
          map.set(key, {
            totalVentas: 0,
            cantidadFacturas: 0,
            montoPendiente: 0,
          });
        }

        const acc = map.get(key)!;
        acc.totalVentas += f.total;
        acc.cantidadFacturas += 1;
        acc.montoPendiente += f.importePendiente || 0;
      }

      return Array.from(map.entries()).map(([producto, data]) => ({
        producto,
        totalVentas: Math.round(data.totalVentas * 100) / 100,
        cantidadFacturas: data.cantidadFacturas,
        montoPendiente: Math.round(data.montoPendiente * 100) / 100,
      }));
    } catch (error) {
      console.error('Error en obtenerVentasXProducto', error);
      throw error;
    }
  }

  async obtenerRankingVendedores(): Promise<{
    vendedor: string;
    cantidadVentas: number;
    ingresos: number;
  }[]> {
    try {
      const facturas = await this.repository.obtenerTodas();

      const map = new Map<
        string,
        { cantidadVentas: number; ingresos: number }
      >();

      for (const f of facturas) {
        const key = f.vendedor || 'Sin vendedor';

        if (!map.has(key)) {
          map.set(key, { cantidadVentas: 0, ingresos: 0 });
        }

        const acc = map.get(key)!;
        acc.cantidadVentas += 1;
        acc.ingresos += f.total;
      }

      return Array.from(map.entries()).map(([vendedor, data]) => ({
        vendedor,
        cantidadVentas: data.cantidadVentas,
        ingresos: Math.round(data.ingresos * 100) / 100,
      }));
    } catch (error) {
      console.error('Error en obtenerRankingVendedores', error);
      throw error;
    }
  }


  /**
   * Obtiene todas las facturas
   */
  async obtenerTodas() {
    return this.repository.obtenerTodas();
  }
}
