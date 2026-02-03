export interface CfdiCreadoDto {
  id: string;
  uuid?: string;
  facturamaId?: string;
  serie?: string;
  folio?: string;
  total: number;
}

export interface CrearNcParcialRequest {
  motive: string;
  conceptos: Array<{
    cfdiConceptoId: string;
    cantidad: number;
  }>;
}