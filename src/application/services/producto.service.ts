import { ProductoRepository } from '../repositories/producto.repository';
import { Producto } from '../../domain/entities/producto.entity';

export class ProductoService {
  constructor(private repository: ProductoRepository) {}

  async obtenerTodos(): Promise<Producto[]> {
    return this.repository.obtenerTodos();
  }

  async obtenerPorId(id: string): Promise<Producto | null> {
    return this.repository.obtenerPorId(id);
  }

  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
  }> {
    const productos = await this.obtenerTodos();
    const activos = productos.filter(p => p.activo || p.Activo).length;

    return {
      total: productos.length,
      activos,
    };
  }
}
