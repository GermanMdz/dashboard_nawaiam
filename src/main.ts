import express from 'express';
import { config } from './infrastructure/config/config';
import { FinnegansHttp } from './infrastructure/http/finnegans.http';
import { AuthService } from './application/services/auth.service';
import { requireAuth } from './infrastructure/middleware/auth.middleware';
import { createAuthRoutes } from './presentation/routes/auth.routes';
import { createClienteRoutes } from './presentation/routes/cliente.routes';
import { createProductoRoutes } from './presentation/routes/producto.routes';
import { createFacturaRoutes } from './presentation/routes/factura.routes';

const app = express();

// Middleware
app.use(express.json());

// Inicializar cliente HTTP de Finnegans (autorefresh token)
const finnegansHttp = new FinnegansHttp(
  config.finnegans.url,
  config.finnegans.clientId,
  config.finnegans.clientSecret,
);

const authService = new AuthService();

// RUTAS SIN PROTECCIÓN (login público)
app.use('/auth', createAuthRoutes(authService));

// RUTAS PROTEGIDAS (requieren token válido)
app.use('/clientes', requireAuth(authService), createClienteRoutes(finnegansHttp));
app.use('/productos', requireAuth(authService), createProductoRoutes(finnegansHttp));
app.use('/facturas', requireAuth(authService), createFacturaRoutes(finnegansHttp));

// Iniciar servidor
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`⭕ API iniciada en puerto ${PORT}`);
    console.log(`Endpoints:`);
    console.log(`   GET /clientes`);
    console.log(`   GET /clientes/:id`);
    console.log(`   GET /clientes/estadisticas`);
    console.log(`   GET /productos`);
    console.log(`   GET /productos/:id`);
    console.log(`   GET /productos/estadisticas`);
    console.log(`   GET /facturas`);
    console.log(`   GET /facturas/dashboardGeneral`);
    console.log('\n');
  });
}

export default app;
