import express from 'express';
import { config } from './infrastructure/config/config';
import { FinnegansHttp } from './infrastructure/http/finnegans.http';
import { createClienteRoutes } from './presentation/routes/cliente.routes';
import { createProductoRoutes } from './presentation/routes/producto.routes';
import { createFacturaRoutes } from './presentation/routes/factura.routes';

const app = express();

// Middleware
app.use(express.json());

// Inicializar cliente HTTP de Finnegans
const finnegansHttp = new FinnegansHttp(
  config.finnegans.url,
  config.finnegans.token
);

// Rutas
app.use('/clientes', createClienteRoutes(finnegansHttp));
app.use('/productos', createProductoRoutes(finnegansHttp));
app.use('/facturas', createFacturaRoutes(finnegansHttp));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '✅ API Finnegans funcionando',
    endpoints: {
      facturas: '/facturas',
      productos: '/productos',
      vendedores: '/vendedores',
      contratos: '/contratos',
      empresas: '/empresas',
    },
  });
});

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

// 🔧 CAMBIO MÍNIMO: esperar el async
(async () => {
  // const accessToken = await getToken();
  // console.log('Token obtenido:', accessToken);
})();

async function getToken(): Promise<string> {
  const clientId = process.env.FINNEGANS_CLIENT_ID;
  const clientSecret = process.env.FINNEGANS_CLIENT_SECRET;

  const url = `https://api.teamplace.finneg.com/api/oauth/token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
  const options = { method: 'GET' };

  try {
    const response = await fetch(url, options);
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    throw error;
  }
}
