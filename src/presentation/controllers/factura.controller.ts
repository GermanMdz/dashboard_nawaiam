import { Request, Response } from 'express';
import { FacturaService } from '../../application/services/factura.service';

export class FacturaController {
  constructor(private service: FacturaService) { }

  /**
   * GET /facturas/meses
   * Obtiene los meses disponibles
   */
  async obtenerMesesDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const meses = await this.service.obtenerMesesDisponibles();
      res.json({
        success: true,
        data: meses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo meses disponibles',
      });
    }
  }

  /**
   * GET /facturas/dashboardGeneral?mes=MM-YYYY
   * Obtiene el dashboard general (mes actual si no se especifica)
   */
  async obtenerDashboardGeneral(req: Request, res: Response): Promise<void> {
    try {
      const mes = req.query.mes as string | undefined;
      const dashboard = await this.service.obtenerDashboardGeneral(mes);
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
   * GET /facturas/ventas-por-producto?mes=MM-YYYY
   */
  async obtenerVentasXProducto(req: Request, res: Response): Promise<void> {
    try {
      const mes = req.query.mes as string | undefined;
      const resultado = await this.service.obtenerVentasXProducto(mes);
      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo ventas por producto',
      });
    }
  }

  /**
   * GET /facturas/ranking-vendedores?mes=MM-YYYY
   */
  async obtenerRankingVendedores(req: Request, res: Response): Promise<void> {
    try {
      const mes = req.query.mes as string | undefined;
      const resultado = await this.service.obtenerRankingVendedores(mes);
      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo ranking de vendedores',
      });
    }
  }

  /**
   * GET /facturas/contratos?mes=MM-YYYY
   */
  async obtenerContratos(req: Request, res: Response): Promise<void> {
    try {
      const mes = req.query.mes as string | undefined;
      const resultado = await this.service.obtenerContratos(mes);
      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo contratos',
      });
    }
  }

  /**
   * GET /facturas/empresas?mes=MM-YYYY
   */
  async obtenerEmpresas(req: Request, res: Response): Promise<void> {
    try {
      const mes = req.query.mes as string | undefined;
      const resultado = await this.service.obtenerEmpresas(mes);
      res.json({
        success: true,
        data: resultado,
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