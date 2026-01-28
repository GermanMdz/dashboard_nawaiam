import { ClienteRepository } from '../repositories/cliente.repository';
import { Cliente } from '../../domain/entities/cliente.entity';

export class ClienteService {
  constructor(private repository: ClienteRepository) {}

  async obtenerTodos(): Promise<Cliente[]> {
    return this.repository.obtenerTodos();
  }

  async obtenerPorId(id: string): Promise<Cliente | null> {
    return this.repository.obtenerPorId(id);
  }

  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
  }> {
    const clientes = await this.obtenerTodos();
    const activos = clientes.filter(c => c.activo || c.Activo).length;

    return {
      total: clientes.length,
      activos,
      inactivos: clientes.length - activos,
    };
  }
}
