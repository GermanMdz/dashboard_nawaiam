import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';
import { Factura } from '../../domain/entities/factura.entity';
import { Redis } from '@upstash/redis';

export class FacturaRepository {
  private redis: Redis;
  private readonly CACHE_KEY = 'facturas:anio';
  private readonly CACHE_TTL = 3600; // 1 hora

  constructor(private http: FinnegansHttp) {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  /**
   * Obtiene todas las facturas del año actual
   * Solicita datos con parámetros de fecha para optimizar el costo de API
   */
  async obtenerTodas(): Promise<Factura[]> {
    try {
      // Intentar obtener del caché primero
      console.log('🔍 Buscando en caché...');
      const cached = await this.redis.hgetall(this.CACHE_KEY).catch(() => null);
      
      if (cached && Object.keys(cached).length > 0) {
        console.log('📦 Datos desde Redis (caché)');
        return Object.values(cached) as Factura[];
      }

      // Si no hay caché, hacer la petición a la API con parámetros de fecha
      console.log('📡 Solicitando datos de todo el año a Finnegans API...');
      const datos = await this.http.get<any[]>('/reports/ANAFACTURACION', {
        PARAMWEBREPORT_FechaDesde: this.obtenerPrimerDiaDelAño(),
        PARAMWEBREPORT_FechaHasta: this.obtenerUltimoDiaDelAño(),
      });
      
      // Normalizar datos
      const facturas = Array.isArray(datos) 
        ? datos.map(d => this.normalizar(d)) 
        : [];

      // Guardar en caché como hash
      if (facturas.length > 0) {
        console.log('💾 Guardando en Redis...');
        const cacheData: Record<string, any> = {};
        facturas.forEach((f, idx) => {
          cacheData[`factura:${idx}`] = f;
        });
        
        await this.redis.hset(this.CACHE_KEY, cacheData);
        await this.redis.expire(this.CACHE_KEY, this.CACHE_TTL);
      }
      
      console.log(`✅ ${facturas.length} facturas guardadas en caché`);
      return facturas;
      
    } catch (error) {
      console.error('❌ Error en FacturaRepository.obtenerTodas:', error);
      throw error;
    }
  }

  /**
   * Obtiene facturas filtradas por mes específico
   * @param mes formato MM-YYYY (ej: "01-2026")
   */
  async obtenerPorMes(mes: string): Promise<Factura[]> {
    try {
      const todas = await this.obtenerTodas();
      const fragment = `-${mes}`;
      return todas.filter(f => f.mes === mes);
    } catch (error) {
      console.error('Error en FacturaRepository.obtenerPorMes:', error);
      throw error;
    }
  }

  /**
   * Obtiene facturas agrupadas por mes
   * Devuelve un objeto donde la clave es el mes (MM-YYYY) 
   * y el valor es un array de facturas de ese mes
   */
  async obtenerPorMeses(): Promise<Record<string, Factura[]>> {
    try {
      const todas = await this.obtenerTodas();
      
      const meses: Record<string, Factura[]> = {};
      
      todas.forEach(factura => {
        if (!meses[factura.mes]) {
          meses[factura.mes] = [];
        }
        meses[factura.mes].push(factura);
      });

      return meses;
    } catch (error) {
      console.error('Error en FacturaRepository.obtenerPorMeses:', error);
      throw error;
    }
  }

  async invalidarCache(): Promise<void> {
    await this.redis.del(this.CACHE_KEY);
    console.log('🗑️ Caché invalidado');
  }

  /**
   * Extrae el mes del formato DD-MM-YYYY a MM-YYYY
   */
  private extraerMes(fecha: string): string {
    // fecha viene como "DD-MM-YYYY"
    const partes = fecha.split('-');
    if (partes.length === 3) {
      return `${partes[1]}-${partes[2]}`; // MM-YYYY
    }
    return '';
  }

  /**
   * Obtiene el primer día del año actual en formato YYYY-MM-DD
   */
  private obtenerPrimerDiaDelAño(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    return `${año}-01-01`;
  }

  /**
   * Obtiene el último día del año actual en formato YYYY-MM-DD
   */
  private obtenerUltimoDiaDelAño(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    return `${año}-12-31`;
  }

  private normalizar(data: any): Factura {
    const fecha = data.FECHA || '';
    const mes = this.extraerMes(fecha);

    return {
      transaccionId: data.TRANSACCIONID?.toString() || '',
      fecha: fecha,
      mes: mes,
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
      numeroContrato: data.NUMEROCONTRATO || '',
      empresa: data.EMPRESA || '',
    };
  }
}