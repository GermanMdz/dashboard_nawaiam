import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';
import { Factura } from '../../domain/entities/factura.entity';
import { redis } from '../../infrastructure/config/kv.config';

export class FacturaRepository {
  private readonly CACHE_KEY = 'facturas:todas';
  private readonly CACHE_TTL = 3600;

  constructor(private http: FinnegansHttp) {}

  async obtenerTodas(): Promise<Factura[]> {
    try {
      const cached = await redis.get<string>(this.CACHE_KEY);
      
      if (cached) {
        console.log('📦 Datos desde Redis (Upstash)');
        return JSON.parse(cached);
      }

      const datos = await this.http.get<any[]>('/reports/ANAFACTURACION');
      const facturas = Array.isArray(datos) 
        ? datos.map(d => this.normalizar(d)) 
        : [];

      await redis.setex(
        this.CACHE_KEY,
        this.CACHE_TTL,
        JSON.stringify(facturas)
      );

      return facturas;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async obtenerPorMes(mes: string): Promise<Factura[]> {
    try {
      const todas = await this.obtenerTodas();
      const fragment = `-${mes}`;
      return todas.filter(f => f.fecha.includes(fragment));
    } catch (error) {
      console.error('Error en FacturaRepository.obtenerPorMes:', error);
      throw error;
    }
  }

  private normalizar(data: any): Factura {
    return {
      transaccionId: data.TRANSACCIONID?.toString() || '',
      fecha: data.FECHA || '',
      cliente: data.CLIENTE || '',
      vendedor: data.VENDEDOR || '',
      producto: data.PRODUCTO || '',
      total: parseFloat(data.TOTAL) || 0,
      totalBruto: parseFloat(data.TOTALBRUTO) || 0,
      totalConceptos: parseFloat(data.TOTALCONCEPTOS) || 0,
      cantidad: parseFloat(data.CANTIDAD) || 0,
      estado: data.ESTADO || '',
      condicionPago: data.CONDICIONPAGO || '',
      moneda: data.MONEDA || '',
      importePendiente: parseFloat(data.IMPORTENETOPENDIENTE) || 0,
      comprobante: data.COMPROBANTE || '',
      descripcion: data.DESCRIPCION || '',
    };
  }
}
