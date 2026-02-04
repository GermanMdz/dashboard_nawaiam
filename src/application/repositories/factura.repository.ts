import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';
import { Factura } from '../../domain/entities/factura.entity';
import { Redis } from '@upstash/redis';

export class FacturaRepository {
  private redis: Redis;
  private readonly CACHE_KEY = 'facturas:todas';
  private readonly CACHE_TTL = 3600;

  constructor(private http: FinnegansHttp) {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  async obtenerTodas(): Promise<Factura[]> {
    try {
      // Intentar obtener del caché
      console.log('🔍 Buscando en caché...');
      const cached = await this.redis.hgetall(this.CACHE_KEY).catch(() => null);
      
      if (cached && Object.keys(cached).length > 0) {
        console.log('📦 Datos desde Redis (caché)');
        // Redis devuelve un objeto, convertirlo a array de facturas
        return Object.values(cached) as Factura[];
      }

      // Si no hay caché, hacer la petición a la API
      console.log('🔄 Solicitando datos a Finnegans API...');
      const datos = await this.http.get<any[]>('/reports/ANAFACTURACION');
      
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

  async invalidarCache(): Promise<void> {
    await this.redis.del(this.CACHE_KEY);
    console.log('🗑️ Caché invalidado');
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
      numeroContrato: data.NUMEROCONTRATO || '',
      empresa: data.EMPRESA || '',
    };
  }
}