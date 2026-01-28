import { Request, Response } from 'express';
import { FacturaService } from '../../application/services/factura.service';

export class FacturaController {
  constructor(private service: FacturaService) {}

  /**
   * GET /facturas/dashboard
   * Obtiene el dashboard general
   */
  async obtenerDashboardGeneral(req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await this.service.obtenerDashboardGeneral();
      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo dashboard',
      });
    }
  }

  /**
   * GET /facturas
   * Obtiene todas las facturas
   */
  async obtenerTodas(req: Request, res: Response): Promise<void> {
    try {
      const facturas = await this.service.obtenerTodas();
      res.json({
        success: true,
        data: facturas,
        total: facturas.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo facturas',
      });
    }
  }
}
