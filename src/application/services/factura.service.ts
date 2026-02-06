import { FacturaRepository } from '../repositories/factura.repository';

export class FacturaService {
  constructor(private repository: FacturaRepository) { }

  /**
   * Obtiene el mes actual en formato MM-YYYY
   */
  private obtenerMesActual(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    return `${mes}-${año}`;
  }

  /**
   * Obtiene todos los meses disponibles con facturas
   */
  async obtenerMesesDisponibles(): Promise<string[]> {
    try {
      const meses = await this.repository.obtenerPorMeses();
      const mesesOrdenados = Object.keys(meses).sort((a, b) => {
        const [mesA, añoA] = a.split('-');
        const [mesB, añoB] = b.split('-');
        const fechaA = new Date(`${añoA}-${mesA}-01`);
        const fechaB = new Date(`${añoB}-${mesB}-01`);
        return fechaB.getTime() - fechaA.getTime(); // Más reciente primero
      });
      return mesesOrdenados;
    } catch (error) {
      console.error('Error en obtenerMesesDisponibles:', error);
      throw error;
    }
  }

  /**
   * Obtiene el dashboard general con estadísticas del mes actual
   */
  async obtenerDashboardGeneral(mesEspecifico?: string): Promise<{
    mes: string;
    mesFormato: string;
    totalVentas: number;
    cantidadFacturas: number;
    promedioPorFactura: number;
    montoPendiente: number;
  }> {
    try {
      const mes = mesEspecifico || this.obtenerMesActual();
      
      const facturasMes = await this.repository.obtenerPorMes(mes);

      const totalVentas = facturasMes.reduce((sum, f) => sum + f.total, 0);
      const cantidadFacturas = facturasMes.length;
      const promedioPorFactura = cantidadFacturas > 0 ? totalVentas / cantidadFacturas : 0;
      const montoPendiente = facturasMes.reduce((sum, f) => sum + f.importePendiente, 0);

      const [mesNum, año] = mes.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesFormato = `${meses[parseInt(mesNum) - 1]} ${año}`;

      return {
        mes,
        mesFormato,
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
   * Obtiene ventas por producto para un mes específico
   */
  async obtenerVentasXProducto(mesEspecifico?: string): Promise<{
    mes: string;
    mesFormato: string;
    datos: {
      producto: string;
      totalVentas: number;
      cantidadFacturas: number;
      montoPendiente: number;
    }[]
  }> {
    try {
      const mes = mesEspecifico || this.obtenerMesActual();
      const facturas = await this.repository.obtenerPorMes(mes);

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

      const [mesNum, año] = mes.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesFormato = `${meses[parseInt(mesNum) - 1]} ${año}`;

      return {
        mes,
        mesFormato,
        datos: Array.from(map.entries()).map(([producto, data]) => ({
          producto,
          totalVentas: Math.round(data.totalVentas * 100) / 100,
          cantidadFacturas: data.cantidadFacturas,
          montoPendiente: Math.round(data.montoPendiente * 100) / 100,
        }))
      };
    } catch (error) {
      console.error('Error en obtenerVentasXProducto', error);
      throw error;
    }
  }

  /**
   * Obtiene ranking de vendedores para un mes específico
   */
  async obtenerRankingVendedores(mesEspecifico?: string): Promise<{
    mes: string;
    mesFormato: string;
    datos: {
      vendedor: string;
      cantidadVentas: number;
      ingresos: number;
    }[]
  }> {
    try {
      const mes = mesEspecifico || this.obtenerMesActual();
      const facturas = await this.repository.obtenerPorMes(mes);

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

      const [mesNum, año] = mes.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesFormato = `${meses[parseInt(mesNum) - 1]} ${año}`;

      return {
        mes,
        mesFormato,
        datos: Array.from(map.entries()).map(([vendedor, data]) => ({
          vendedor,
          cantidadVentas: data.cantidadVentas,
          ingresos: Math.round(data.ingresos * 100) / 100,
        }))
      };
    } catch (error) {
      console.error('Error en obtenerRankingVendedores', error);
      throw error;
    }
  }

  /**
   * Obtiene contratos para un mes específico
   */
  async obtenerContratos(mesEspecifico?: string): Promise<{
    mes: string;
    mesFormato: string;
    datos: {
      numeroContrato: string;
      cantidad: number;
      totalVentas: number;
    }[]
  }> {
    try {
      const mes = mesEspecifico || this.obtenerMesActual();
      const facturas = await this.repository.obtenerPorMes(mes);

      const contratos: { [key: string]: { cantidad: number; totalVentas: number } } = {};

      for (const f of facturas) {
        const numeroContrato = f.numeroContrato?.trim() || 'Otros';
        
        if (!contratos[numeroContrato]) {
          contratos[numeroContrato] = { cantidad: 0, totalVentas: 0 };
        }

        contratos[numeroContrato].cantidad += 1;
        contratos[numeroContrato].totalVentas += f.total;
      }

      const [mesNum, año] = mes.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesFormato = `${meses[parseInt(mesNum) - 1]} ${año}`;

      return {
        mes,
        mesFormato,
        datos: Object.entries(contratos).map(([numeroContrato, data]) => ({
          numeroContrato,
          cantidad: data.cantidad,
          totalVentas: Math.round(data.totalVentas * 100) / 100,
        }))
      };
    } catch (error) {
      console.error('Error en obtenerContratos', error);
      throw error;
    }
  }

  /**
   * Obtiene empresas para un mes específico
   */
  async obtenerEmpresas(mesEspecifico?: string): Promise<{
    mes: string;
    mesFormato: string;
    datos: {
      empresa: string;
      cantidadFacturas: number;
      totalVentas: number;
    }[]
  }> {
    try {
      const mes = mesEspecifico || this.obtenerMesActual();
      const facturas = await this.repository.obtenerPorMes(mes);

      const empresas: { [key: string]: { cantidadFacturas: number; totalVentas: number } } = {};

      for (const f of facturas) {
        const empresa = f.empresa?.trim() || 'Otros';
        
        if (!empresas[empresa]) {
          empresas[empresa] = { cantidadFacturas: 0, totalVentas: 0 };
        }

        empresas[empresa].cantidadFacturas += 1;
        empresas[empresa].totalVentas += f.total;
      }

      const [mesNum, año] = mes.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesFormato = `${meses[parseInt(mesNum) - 1]} ${año}`;

      return {
        mes,
        mesFormato,
        datos: Object.entries(empresas).map(([empresa, data]) => ({
          empresa,
          cantidadFacturas: data.cantidadFacturas,
          totalVentas: Math.round(data.totalVentas * 100) / 100,
        }))
      };
    } catch (error) {
      console.error('Error en obtenerEmpresas', error);
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