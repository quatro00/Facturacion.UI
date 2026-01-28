import { CfdiConceptoDto } from "./CfdiConceptoDto";
import { CfdiHistorialDto } from "./CfdiHistorialDto";

export interface CfdiDetalleDto {
  id: string;
  facturamaId: string;
  uuid: string;

  serie?: string | null;
  folio?: string | null;

  tipoCfdi: 'I' | 'E' | 'P' | 'T';
  moneda: 'MXN' | 'USD';
  fechaTimbrado: string; // ISO

  subtotal: number;
  descuento: number;
  total: number;

  formaPago?: string | null;
  metodoPago?: string | null;
  lugarExpedicion: string;

  rfcEmisor: string;
  razonSocialEmisor?: string | null;

  rfcReceptor: string;
  razonSocialReceptor?: string | null;

  estatus: string; // TIMBRADO/CANCELADO/...
  motivoCancelacion?: string | null;
  uuidSustitucion?: string | null;

  conceptos: CfdiConceptoDto[];
  historial: CfdiHistorialDto[];
}