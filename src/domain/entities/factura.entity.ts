export interface Factura {
  transaccionId: string;
  fecha: string;
  cliente: string;
  vendedor: string;
  producto: string;
  total: number;
  totalBruto: number;
  totalConceptos: number;
  cantidad: number;
  estado: string;
  condicionPago: string;
  moneda: string;
  importePendiente: number;
  comprobante: string;
  descripcion: string;
  numeroContrato: string;
  [key: string]: any;
}
