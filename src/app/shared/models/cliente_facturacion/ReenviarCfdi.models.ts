export interface ReenviarCfdiDialogData {
  uuid: string;
  serie: string;
  folio: string;
  receptorRfc: string;
  total: number;
  estatus: string; // 'TIMBRADO' | 'CANCELADO' etc.
}

export interface ReenviarCfdiDialogResult {
  emailTo?: string | null;
  includeXml: boolean;
  includePdf: boolean;
  includeAcuseCancelacion: boolean;
  subject?: string | null;
  message?: string | null;
}