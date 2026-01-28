import { FacturaRepository } from '../repositories/factura.repository';

export class FacturaService {
  constructor(private repository: FacturaRepository) {}

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

  /**
   * Obtiene todas las facturas
   */
  async obtenerTodas() {
    return this.repository.obtenerTodas();
  }
}
