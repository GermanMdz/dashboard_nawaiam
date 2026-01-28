import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';
import { Cliente } from '../../domain/entities/cliente.entity';

export class ClienteRepository {
  constructor(private http: FinnegansHttp) {}

  async obtenerTodos(): Promise<Cliente[]> {
    try {
      const datos = await this.http.get<any[]>('/cliente/list');
      return Array.isArray(datos) ? datos.map(d => this.normalizar(d)) : [];
    } catch (error) {
      console.error('Error en ClienteRepository.obtenerTodos:', error);
      throw error;
    }
  }

  async obtenerPorId(id: string): Promise<Cliente | null> {
    try {
      const clientes = await this.obtenerTodos();
      return clientes.find(c => c.codigo === id) || null;
    } catch (error) {
      console.error('Error en ClienteRepository.obtenerPorId:', error);
      throw error;
    }
  }

  private normalizar(data: any): Cliente {
    return {
      codigo: data.codigo || data.Codigo || '',
      nombre: data.nombre || data.Nombre || '',
      razonSocial: data.razonSocial || data.RazonSocial,
      activo: data.activo !== undefined ? data.activo : data.Activo,
    };
  }
}