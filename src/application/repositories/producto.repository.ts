import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';
import { Producto } from '../../domain/entities/producto.entity';

export class ProductoRepository {
  constructor(private http: FinnegansHttp) {}

  async obtenerTodos(): Promise<Producto[]> {
    try {
      const datos = await this.http.get<any[]>('/producto/list');
      return Array.isArray(datos) ? datos.map(d => this.normalizar(d)) : [];
    } catch (error) {
      console.error('Error en ProductoRepository.obtenerTodos:', error);
      throw error;
    }
  }

  async obtenerPorId(id: string): Promise<Producto | null> {
    try {
      const productos = await this.obtenerTodos();
      return productos.find(p => p.codigo === id) || null;
    } catch (error) {
      console.error('Error en ProductoRepository.obtenerPorId:', error);
      throw error;
    }
  }

  private normalizar(data: any): Producto {
    return {
      codigo: data.codigo || data.Codigo || '',
      nombre: data.nombre || data.Nombre || '',
      descripcion: data.descripcion || data.Descripcion,
      precio: data.precio || data.Precio,
      activo: data.activo !== undefined ? data.activo : data.Activo,
    };
  }
}