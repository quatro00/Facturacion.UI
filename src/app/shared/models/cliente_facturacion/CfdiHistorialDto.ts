export interface CfdiHistorialDto {
  id: string;
  estatus: string;
  motivo?: string | null;
  createdAt: string; // ISO
}