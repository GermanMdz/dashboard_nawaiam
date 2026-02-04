import { Request, Response } from 'express';
import { FacturaService } from '../../application/services/factura.service';

export class FacturaController {
  constructor(private service: FacturaService) { }

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

  async obtenerVentasXProducto(req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await this.service.obtenerVentasXProducto();
      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo ventas por producto',
      });
    }
  }

  async obtenerRankingVendedores(req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await this.service.obtenerRankingVendedores();
      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo ranking de vendedores',
      });
    }
  }

  async obtenerContratos(req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await this.service.obtenerContratos();
      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo contratos',
      });
    }
  }

  async obtenerEmpresas(req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await this.service.obtenerEmpresas();
      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo empresas',
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
