import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { fuseAnimations } from '@fuse/animations';

import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { ConfirmDialogComponent } from 'app/modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatCommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatIcon,
    MatMenuModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class ClientesComponent {

  // UI
  isLoading = false;
  private filterVersion = 0;
  // Controls
  searchInputControl = new UntypedFormControl('');
  estadoControl = new UntypedFormControl('');
  monedaControl = new UntypedFormControl('');
  usoCfdiControl = new UntypedFormControl('');

  // Options (ajusta según tu catálogo real si ya lo tienes)
  usoCfdiOptions: string[] = [
    'G01', 'G02', 'G03',
    'I01', 'I02', 'I03',
    'D01', 'D02', 'D03',
    'P01', 'S01', 'CP01', 'CN01'
  ];

  displayedColumns: string[] = ['rfc', 'razonSocial', 'moneda', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  private allRows: any[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private _dialog: MatDialog,
    private router: Router,
    private cliente_clientesService: Cliente_Clientes
  ) { }

  ngOnInit(): void {
    this.reload();

    // Search
    this.searchInputControl.valueChanges.subscribe(() => this.applyFilters());

    // Predicado (search + filtros)
    this.dataSource.filterPredicate = (row, _dummy) => {
      const q = (this.searchInputControl.value || '').toString().trim().toLowerCase();

      const matchText =
        !q ||
        [
          row.rfc,
          row.razonSocial,
          row.usoCfdi,
          row.moneda
        ].filter(Boolean).join(' ').toLowerCase().includes(q);

      const estado = this.estadoControl.value;
      const matchEstado =
        !estado ||
        (estado === 'activos' && !!row.activo) ||
        (estado === 'inactivos' && !row.activo);

      const moneda = this.monedaControl.value;
      const matchMoneda = !moneda || row.moneda === moneda;

      const uso = this.usoCfdiControl.value;
      const matchUso = !uso || row.usoCfdi === uso;

      return matchText && matchEstado && matchMoneda && matchUso;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // ✅ sorting: define qué propiedad usar por columna
    this.dataSource.sortingDataAccessor = (row: any, column: string) => {
      switch (column) {
        case 'rfc': return (row.rfc || '').toString().toLowerCase();
        case 'razonSocial': return (row.razonSocial || '').toString().toLowerCase();
        case 'moneda': return (row.moneda || '').toString();
        case 'estado': return row.activo ? 1 : 0;
        default: return (row[column] ?? '').toString().toLowerCase();
      }
    };
  }

  reload(): void {
    this.isLoading = true;

    this.cliente_clientesService.Get().subscribe({
      next: (rows) => {
        this.allRows = rows || [];
        this.dataSource.data = this.allRows;
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filterVersion++;
    this.dataSource.filter = this.filterVersion.toString();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.estadoControl.setValue('');
    this.monedaControl.setValue('');
    this.usoCfdiControl.setValue('');
    this.searchInputControl.setValue('');
    this.applyFilters();
  }

  // Navegación / acciones
  nuevoCliente(): void {
    this.router.navigate(['/cliente/clientes/nuevo']);
  }

  verCliente(id: any): void {
    this.router.navigate(['/cliente', 'clientes', 'cliente', id]);
  }

  facturar(id: any): void {
    this.router.navigate(['/cliente', 'clientes', 'cliente', id, 'facturar']);
  }

  editar(item: any): void {
    // aquí abres modal o navegas, según tu flujo
  }

  verCfdis(org: any): void {
    // si tienes ruta por RFC o clienteId, úsala aquí
    // ejemplo:
    // this.router.navigate(['/cliente/cfdis'], { queryParams: { rfc: org.rfc } });
  }

  toggleActivo(org: any): void {
    const activar = !org.activo;

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: activar ? 'Activar cliente' : 'Desactivar cliente',
        message: activar
          ? `¿Deseas activar al cliente "${org.razonSocial}"?`
          : `¿Deseas desactivar al cliente "${org.razonSocial}"?`,
        confirmText: activar ? 'Activar' : 'Desactivar',
        cancelText: 'Cancelar',
        color: activar ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.cliente_clientesService.updateActivo(org.clienteId, activar).subscribe({
        next: (res) => {
          org.activo = res.activo;
          this.applyFilters();
        },
        error: (err) => console.error(err)
      });
    });
  }
}