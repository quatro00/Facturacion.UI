import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

type CfdiStatus = 'TIMBRADO' | 'CANCELADO' | 'BORRADOR' | 'ERROR';

interface Kpi {
  title: string;
  value: string;
  hint: string;
  trend?: { direction: 'up' | 'down'; value: string; note: string };
  icon: string;
}

interface MonthlyPoint {
  label: string;   // "Ene"
  amount: number;  // total facturado
}

interface StatusSlice {
  status: CfdiStatus;
  label: string;
  value: number; // porcentaje 0-100
}

interface RecentCfdiRow {
  id: string;
  uuid: string;
  fecha: Date;
  serie: string;
  folio: string;
  receptor: string;
  rfc: string;
  total: number;
  moneda: 'MXN' | 'USD';
  estatus: CfdiStatus;
}

interface TopClientRow {
  nombre: string;
  rfc: string;
  facturas: number;
  total: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    DatePipe,

    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  // Header
  periodoLabel = 'Últimos 30 días';
  lastSync = new Date();

  // KPIs (dummy)
  kpis: Kpi[] = [
    {
      title: 'Facturado (MXN)',
      value: '$1,284,550.00',
      hint: 'Total timbrado en el periodo seleccionado',
      trend: { direction: 'up', value: '+12.4%', note: 'vs. periodo anterior' },
      icon: 'paid'
    },
    {
      title: 'CFDIs emitidos',
      value: '1,248',
      hint: 'Incluye ingreso, egreso y pagos',
      trend: { direction: 'up', value: '+4.1%', note: 'vs. periodo anterior' },
      icon: 'receipt_long'
    },
    {
      title: 'Cancelaciones',
      value: '18',
      hint: 'CFDIs cancelados en el periodo',
      trend: { direction: 'down', value: '-2.0%', note: 'vs. periodo anterior' },
      icon: 'block'
    },
    {
      title: 'Notas de crédito',
      value: '42',
      hint: 'Total de egresos (NC) emitidas',
      trend: { direction: 'up', value: '+9.5%', note: 'vs. periodo anterior' },
      icon: 'note_alt'
    }
  ];

  // Gráfica barras (dummy) - últimos 12 meses
  facturacion12m: MonthlyPoint[] = [
    { label: 'Feb', amount: 820000 },
    { label: 'Mar', amount: 910000 },
    { label: 'Abr', amount: 760000 },
    { label: 'May', amount: 980000 },
    { label: 'Jun', amount: 1120000 },
    { label: 'Jul', amount: 1050000 },
    { label: 'Ago', amount: 990000 },
    { label: 'Sep', amount: 1210000 },
    { label: 'Oct', amount: 1320000 },
    { label: 'Nov', amount: 1280000 },
    { label: 'Dic', amount: 1490000 },
    { label: 'Ene', amount: 1380000 },
  ];

  // Donut estatus (dummy)
  statusSlices: StatusSlice[] = [
    { status: 'TIMBRADO', label: 'Timbrado', value: 86 },
    { status: 'CANCELADO', label: 'Cancelado', value: 6 },
    { status: 'BORRADOR', label: 'Borrador', value: 5 },
    { status: 'ERROR', label: 'Error', value: 3 }
  ];

  // Tabla CFDIs recientes (dummy)
  recentDisplayedColumns = ['fecha', 'folio', 'receptor', 'total', 'estatus', 'acciones'];
  recentCfdis: RecentCfdiRow[] = [
    {
      id: '1',
      uuid: '3F9A9D3B-1A25-4D8A-9E2D-8A5B77C0A111',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 5),
      serie: 'A',
      folio: '10293',
      receptor: 'Restaurantes del Norte SA de CV',
      rfc: 'RNN010203AB1',
      total: 2850.00,
      moneda: 'MXN',
      estatus: 'TIMBRADO'
    },
    {
      id: '2',
      uuid: '0B11C6F4-5D7F-4A12-A1A2-9D5B16D0B222',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 9),
      serie: 'A',
      folio: '10292',
      receptor: 'Comercializadora La Esquina',
      rfc: 'CLE9201013A9',
      total: 17950.45,
      moneda: 'MXN',
      estatus: 'TIMBRADO'
    },
    {
      id: '3',
      uuid: 'D7D0B322-7A13-4B17-8CF9-6A51E8BB0333',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 18),
      serie: 'NC',
      folio: '00041',
      receptor: 'Servicios Industriales Orion',
      rfc: 'SIO050505KJ2',
      total: 1250.00,
      moneda: 'MXN',
      estatus: 'CANCELADO'
    },
    {
      id: '4',
      uuid: 'A3B2C111-ABCD-4F0F-9EE1-001122334444',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 22),
      serie: 'A',
      folio: '10291',
      receptor: 'Cliente Demo (Sandbox)',
      rfc: 'XAXX010101000',
      total: 999.99,
      moneda: 'MXN',
      estatus: 'ERROR'
    },
    {
      id: '5',
      uuid: 'F0F0F0F0-1D1D-2C2C-3B3B-4A4A4A4A5555',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 30),
      serie: 'A',
      folio: '10290',
      receptor: 'Distribuidora Central',
      rfc: 'DCE991010AB3',
      total: 54230.10,
      moneda: 'MXN',
      estatus: 'BORRADOR'
    }
  ];

  // Top clientes (dummy)
  topClients: TopClientRow[] = [
    { nombre: 'Restaurantes del Norte SA de CV', rfc: 'RNN010203AB1', facturas: 132, total: 412550.12 },
    { nombre: 'Distribuidora Central', rfc: 'DCE991010AB3', facturas: 87, total: 365230.45 },
    { nombre: 'Servicios Industriales Orion', rfc: 'SIO050505KJ2', facturas: 64, total: 248120.00 },
    { nombre: 'Comercializadora La Esquina', rfc: 'CLE9201013A9', facturas: 59, total: 199880.80 },
  ];

  // Alertas (dummy)
  alerts = [
    { icon: 'warning', title: 'Certificados próximos a vencer', desc: '1 razón social con CSD a < 30 días.' },
    { icon: 'sync_problem', title: 'Última sincronización fallida', desc: 'Reintenta la descarga masiva de CFDIs.' },
    { icon: 'info', title: 'Revisión de cancelaciones', desc: 'Hay 3 solicitudes pendientes de confirmación.' },
  ];

  // Helpers para barras
  get maxMonthlyAmount(): number {
    return Math.max(...this.facturacion12m.map(x => x.amount));
  }

  barHeightPx(amount: number): number {
    const max = this.maxMonthlyAmount || 1;
    const pct = amount / max;
    return Math.round(110 * pct) + 10; // 10..120 px
  }

  // Donut gradient con 4 slices
  get donutStyle(): string {
    const s = this.statusSlices;
    const a = s[0]?.value ?? 0;
    const b = s[1]?.value ?? 0;
    const c = s[2]?.value ?? 0;
    const d = s[3]?.value ?? 0;

    const ab = a + b;
    const abc = a + b + c;

    // Colores se controlan por CSS variables definidas en SCSS
    return `conic-gradient(
      var(--ds-ok) 0% ${a}%,
      var(--ds-cancel) ${a}% ${ab}%,
      var(--ds-draft) ${ab}% ${abc}%,
      var(--ds-error) ${abc}% 100%
    )`;
  }

  statusChipClass(s: CfdiStatus): string {
    switch (s) {
      case 'TIMBRADO': return 'chip chip-ok';
      case 'CANCELADO': return 'chip chip-cancel';
      case 'BORRADOR': return 'chip chip-draft';
      case 'ERROR': return 'chip chip-error';
      default: return 'chip';
    }
  }

  refresh(): void {
    // Dummy: simula actualizar datos
    this.lastSync = new Date();
  }

  // Acciones dummy
  openCfdi(row: RecentCfdiRow): void {
    console.log('Abrir CFDI', row);
  }
  downloadXml(row: RecentCfdiRow): void {
    console.log('Descargar XML', row);
  }
  downloadPdf(row: RecentCfdiRow): void {
    console.log('Descargar PDF', row);
  }
}