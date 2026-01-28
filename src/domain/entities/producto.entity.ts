export interface Producto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  activo?: boolean;
  [key: string]: any;
}