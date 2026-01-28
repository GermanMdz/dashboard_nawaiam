import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { ClienteService } from '../../application/services/cliente.service';
import { ClienteRepository } from '../../application/repositories/cliente.repository';
import { FinnegansHttp } from '../../infrastructure/http/finnegans.http';

export function createClienteRoutes(http: FinnegansHttp): Router {
  const router = Router();
  
  // Inyección de dependencias
  const repository = new ClienteRepository(http);
  const service = new ClienteService(repository);
  const controller = new ClienteController(service);

  // Rutas
  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/estadisticas', (req, res) => controller.obtenerEstadisticas(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));

  return router;
}
