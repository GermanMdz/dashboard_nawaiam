import { Request, Response } from 'express';
import { ClienteService } from '../../application/services/cliente.service';

export class ClienteController {
  constructor(private service: ClienteService) {}

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await this.service.obtenerTodos();
      res.json({
        success: true,
        data: clientes,
        total: clientes.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo clientes',
      });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cliente = await this.service.obtenerPorId(id);

      if (!cliente) {
        res.status(404).json({
          success: false,
          error: 'Cliente no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo cliente',
      });
    }
  }

  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.service.obtenerEstadisticas();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas',
      });
    }
  }
}
