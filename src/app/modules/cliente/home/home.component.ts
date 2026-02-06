import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cliente_Dashboard } from 'app/services/cliente/cliente_dashboard.service';

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
export class HomeComponent implements OnInit {

  // Header
  periodoLabel = 'Últimos 30 días';
  lastSync = new Date();
  isLoading = false;

  constructor(private dashboardService: Cliente_Dashboard, private cdr: ChangeDetectorRef) { }

  loadDashboard(): void {
    this.isLoading = true;
    const now = new Date();
    const desde = new Date();
    desde.setDate(now.getDate() - 30);

    const payload = {
      desde: desde.toISOString(),
      hasta: now.toISOString(),
      moneda: 'MXN',
      takeRecientes: 10,
      takeTopClientes: 5,
      mesesHistorico: 12
    };

    this.dashboardService.getDashboard(payload)
      .subscribe({
        next: (res) => {
          this.kpis = res.kpis ?? [];
          this.facturacion12m = res.facturacion12m ?? [];
          this.statusSlices = res.statusSlices ?? [];
          this.recentCfdis = res.recentCfdis ?? [];
          this.topClients = res.topClients ?? [];
          this.alerts = res.alerts ?? [];
          this.lastSync = new Date();
          this.isLoading = false;

          this.cdr.markForCheck(); // ✅
        },
        error: (err) => {
          console.error('Error cargando dashboard', err);
          this.isLoading = false;
          this.cdr.markForCheck(); // ✅
        }
      });
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  // KPIs (dummy)
  kpis: Kpi[];

  // Gráfica barras (dummy) - últimos 12 meses
  facturacion12m: MonthlyPoint[];

  // Donut estatus (dummy)
  statusSlices: StatusSlice[];

  // Tabla CFDIs recientes (dummy)
  recentDisplayedColumns = ['fecha', 'folio', 'receptor', 'total', 'estatus', 'acciones'];
  recentCfdis: RecentCfdiRow[];

  // Top clientes (dummy)
  topClients: TopClientRow[];

  // Alertas (dummy)
  alerts;

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