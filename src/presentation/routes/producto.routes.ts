import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';
import { ProductoService } from '../../application/services/producto.service';
import { ProductoRepository } from '../../application/repositories/producto.repository';
import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';

export function createProductoRoutes(http: FinnegansHttp): Router {
  const router = Router();
  
  // Inyección de dependencias
  const repository = new ProductoRepository(http);
  const service = new ProductoService(repository);
  const controller = new ProductoController(service);

  // Rutas
  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/estadisticas', (req, res) => controller.obtenerEstadisticas(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));

  return router;
}
