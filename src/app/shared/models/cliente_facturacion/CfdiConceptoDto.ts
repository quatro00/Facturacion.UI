export interface CfdiConceptoDto {
  id: string;
  productCode?: string;
  unitCode?: string;
  cantidad: number;
  unidad?: string;
  descripcion: string;
  valorUnitario: number;
  descuento: number;
  importe: number;
}