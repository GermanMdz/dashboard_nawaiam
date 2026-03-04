import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';
import { Factura } from '../../domain/entities/factura.entity';
import { Redis } from '@upstash/redis';

export class FacturaRepository {
  private redis: Redis;
  private readonly CACHE_KEY = 'facturas:5years';
  private readonly CACHE_TTL = 3600; // 1 hora

  constructor(private http: FinnegansHttp) {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  /**
   * Obtiene todas las facturas de los últimos 5 años (incluyendo el año actual)
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
      console.log('📡 Solicitando datos de los últimos 5 años a Finnegans API...');
      const datos = await this.http.get<any[]>('/reports/ANAFACTURACION', {
        PARAMWEBREPORT_FechaDesde: this.obtenerPrimerDiaHace5Anos(),
        PARAMWEBREPORT_FechaHasta: this.obtenerUltimoDiaDelAño(),
        PARAMWEBREPORT_dimension: 'DIMCTC',
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

  /**
   * Obtiene facturas agrupadas por año
   * Devuelve un objeto donde la clave es el año (YYYY)
   * y el valor es un array de facturas de ese año
   */
  async obtenerPorAños(): Promise<Record<string, Factura[]>> {
    try {
      const todas = await this.obtenerTodas();
      
      const años: Record<string, Factura[]> = {};
      
      todas.forEach(factura => {
        const año = factura.mes.split('-')[1]; // Extraer año de MM-YYYY
        if (!años[año]) {
          años[año] = [];
        }
        años[año].push(factura);
      });

      return años;
    } catch (error) {
      console.error('Error en FacturaRepository.obtenerPorAños:', error);
      throw error;
    }
  }

  /**
   * Obtiene facturas filtradas por año específico
   * @param año formato YYYY (ej: "2026")
   */
  async obtenerPorAño(año: string): Promise<Factura[]> {
    try {
      const todas = await this.obtenerTodas();
      return todas.filter(f => f.mes.endsWith(`-${año}`));
    } catch (error) {
      console.error('Error en FacturaRepository.obtenerPorAño:', error);
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
   * Obtiene el primer día de hace 5 años en formato YYYY-MM-DD
   */
  private obtenerPrimerDiaHace5Anos(): string {
    const hoy = new Date();
    const año = hoy.getFullYear() - 4; // Hace 4 años (más el actual = 5 años)
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
      total: parseFloat(data.IMPORTEMONSECUNDARIA) || 0,
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
      dimensionValor: data.DIMENSIONVALOR || '',
      // nivel1dimension: data.NIVEL1DIMENSION || '',
      // nivel2dimension: data.NIVEL2DIMENSION || '',
      // importeMonSecundaria: parseFloat(data.IMPORTEMONSECUNDARIA) || 0,
    };
  }
}