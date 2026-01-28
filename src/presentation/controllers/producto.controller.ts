import { Request, Response } from 'express';
import { ProductoService } from '../../application/services/producto.service';

export class ProductoController {
  constructor(private service: ProductoService) {}

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const productos = await this.service.obtenerTodos();
      res.json({
        success: true,
        data: productos,
        total: productos.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo productos',
      });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const producto = await this.service.obtenerPorId(id);

      if (!producto) {
        res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: producto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo producto',
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
