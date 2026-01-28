# Finnegans API - Clean Architecture

API Express con Clean Architecture que trae datos de Finnegans.

## 🏗️ Estructura

```
src/
├── domain/                    # Entidades
│   └── entities/
├── application/               # Lógica de negocio
│   ├── services/
│   └── repositories/
├── infrastructure/            # Configuración e integraciones
│   ├── config/
│   └── http/
├── presentation/              # Endpoints
│   ├── controllers/
│   └── routes/
└── main.ts                   # Entrada
```

## 🚀 Setup

### 1. Instalar
```bash
npm install
```

### 2. Configurar
```bash
cp .env.example .env
# Edita .env con tu token
```

### 3. Ejecutar
```bash
npm run dev
```

## 📡 Endpoints

### Clientes
```bash
GET  /clientes                    # Todos los clientes
GET  /clientes/:id                # Cliente por ID
GET  /clientes/estadisticas       # Estadísticas
```

### Productos
```bash
GET  /productos                   # Todos los productos
GET  /productos/:id               # Producto por ID
GET  /productos/estadisticas      # Estadísticas
```

## 📝 Ejemplo

```bash
curl http://localhost:3000/clientes
```

Respuesta:
```json
{
  "success": true,
  "data": [...],
  "total": 5
}
```

## 🏗️ Build

```bash
npm run build
npm start
```
