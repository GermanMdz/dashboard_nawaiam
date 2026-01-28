export interface Cliente {
  codigo: string;
  nombre: string;
  razonSocial?: string;
  activo?: boolean;
  [key: string]: any;
}