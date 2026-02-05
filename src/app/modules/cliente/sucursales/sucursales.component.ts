import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil
} from 'rxjs';
import { Cliente_Sucursal } from 'app/services/cliente/cliente_sucursal.service';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface SucursalRow {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  municipio?: string | null;
  estado?: string | null;
  cp?: string | null;
  razonesSociales?: {
    id: string;
    rfc: string;
    razonSocial: string;
    esDefault?: boolean;
  }[];
}

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatTableModule,
    MatSortModule,
    MatPaginatorModule,

    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
  ],
  templateUrl: './sucursales.component.html',
})
export class SucursalesComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  isLoading = false;
  
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'razones',
    'estatus',
    'acciones'
  ];

  dataSource = new MatTableDataSource<SucursalRow>([]);
  totalCount = 0;

  razonesOptions = [
    /*
    { id: 'rs-1', rfc: 'AAA010101AAA', razonSocial: 'Razón Social Demo 1' },
    { id: 'rs-2', rfc: 'BBB010101BBB', razonSocial: 'Razón Social Demo 2' }
     */
  ];

  filtersForm: FormGroup = this.fb.group({
    q: [''],
    status: ['ALL' as StatusFilter],
    razonSocialId: ['ALL']
  });

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // =============================
  // INIT
  // =============================

  constructor(
    private clientePerfil: Cliente_Perfil,
  private sucursalService: Cliente_Sucursal
) {}

  ngOnInit(): void {
    this.cargarRazonesSociales();
    this.loadData();

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.paginator) this.paginator.firstPage();
        this.loadData();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadData());
  }

  cargarRazonesSociales(): void {
      this.isLoading = true;
  
      this.clientePerfil.GetRazonesSociales()
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (res) => (this.razonesOptions = res ?? []),
          error: (err) => {
            console.error('Error cargando razones sociales', err);
            this.razonesOptions = [];
          }
        });
    }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================
  // ACTIONS
  // =============================

  nuevaSucursal(): void {
    this.router.navigate(['/cliente/sucursales/nueva']);
  }

  editar(row: SucursalRow): void {
    this.router.navigate(['/cliente/sucursales', row.id, 'editar']);
  }

  verDetalle(row: SucursalRow): void {
    this.router.navigate(['/cliente/sucursales', row.id]);
  }

  toggleActivo(row: SucursalRow): void {
    const nuevoEstado = !row.activo;
    this.isLoading = true;

    // TODO: conectar a endpoint real
    this.sucursalService.ToggleSucursal(row.id, nuevoEstado)
    .subscribe({
      next: () => {
        row.activo = nuevoEstado;
        this.dataSource.data = [...this.dataSource.data];

        this.snack.open(
          nuevoEstado ? 'Sucursal activada' : 'Sucursal desactivada',
          'OK',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error(err);
        this.snack.open(
          'No se pudo actualizar el estatus de la sucursal',
          'OK',
          { duration: 3500 }
        );
      },
      complete: () => this.isLoading = false
    });
  }

  limpiarFiltros(): void {
    this.filtersForm.reset({
      q: '',
      status: 'ALL',
      razonSocialId: 'ALL'
    });
  }

  // =============================
  // DATA
  // =============================

  private loadData(): void {

    this.isLoading = true;

    const { q, status, razonSocialId } = this.filtersForm.getRawValue();

    // 🔥 Aquí irá tu endpoint real
    // this.sucursalesService.getSucursales(...)

    this.sucursalService.GetSucursales({
    q,
    status,
    razonSocialId: razonSocialId === 'ALL' ? null : razonSocialId,
    page: (this.paginator?.pageIndex ?? 0) + 1,
    pageSize: this.paginator?.pageSize ?? 10,
    sort: this.sort?.active ?? 'codigo',
    dir: this.sort?.direction ?? 'asc'
  })
  .subscribe({
    next: (res) => {
      this.dataSource.data = res.items;
      this.totalCount = res.total;
    },
    error: (err) => {
      console.error(err);
      this.snack.open('Error al cargar sucursales', 'OK', { duration: 3500 });
    },
    complete: () => this.isLoading = false
  });


  }

  // =============================
  // HELPERS
  // =============================

  getStatusLabel(row: SucursalRow): string {
    return row.activo ? 'Activa' : 'Inactiva';
  }

  getStatusChipClass(row: SucursalRow): string {
    return row.activo ? 'primary' : 'warn';
  }

  formatUbicacion(row: SucursalRow): string {
    const parts = [row.municipio, row.estado, row.cp].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }

  razonesResumen(row: SucursalRow): { text: string; tooltip: string } {

    const rs = row.razonesSociales ?? [];
    if (!rs.length) {
      return { text: '—', tooltip: 'Sin razones sociales asociadas' };
    }

    const first = rs[0];
    const more = rs.length - 1;
    const def = rs.find(x => x.esDefault);

    const text = more > 0
      ? `${first.razonSocial}${def ? ' (default)' : ''} +${more}`
      : `${first.razonSocial}${def ? ' (default)' : ''}`;

    const tooltip = rs
      .map(x => `${x.razonSocial} (${x.rfc})${x.esDefault ? ' • default' : ''}`)
      .join('\n');

    return { text, tooltip };
  }

}