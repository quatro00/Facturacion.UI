import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { AlertService } from 'app/services/alert.service';
import { CatCategoriaService } from 'app/services/admin/catcategoria.service';
import { CatPrioridadService } from 'app/services/admin/catprioridad.service';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { SeleccionAreaComponent } from 'app/modals/seleccion-area/seleccion-area.component';
import { TicketService } from 'app/services/admin/ticket.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { filter } from 'lodash';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Cliente_Factura } from 'app/services/cliente/cliente_factura.service';


type CfdiStatus = 'Activo' | 'Cancelado';

export interface CfdiRow {
  id: string;            // GUID interno tuyo (o cfdiId)
  facturamaId: string;   // Id de Facturama (para descargar)
  uuid: string;

  fecha: Date;

  serie: string;
  folio: string;

  receptorRfc: string;
  receptorNombre: string;

  tipo: 'I' | 'E' | 'P' | 'T';
  moneda: 'MXN' | 'USD';

  subtotal: number;
  total: number;

  estatus: CfdiStatus;
}

@Component({
  selector: 'app-cfdis-list',
  imports: [
    CommonModule,
  FormsModule,
  ReactiveFormsModule,

  // Angular Material
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatMenuModule,
  MatChipsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  ],
  templateUrl: './cfdis-list.component.html',
  styleUrl: './cfdis-list.component.scss'
})
export class CfdisListComponent implements AfterViewInit {

  private today = new Date();
  private thirtyDaysAgo = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate() - 30
  );


  isLoading = false;

  displayedColumns = ['fecha', 'serieFolio', 'receptor', 'uuid', 'total', 'estatus', 'acciones'];

  dataSource = new MatTableDataSource<CfdiRow>([]);

  // Search & filters
  searchInputControl = new FormControl<string>('', { nonNullable: true });

  // FormControls
  fromControl = new FormControl<Date | null>(this.thirtyDaysAgo);
  toControl = new FormControl<Date | null>(this.today);
  statusControl = new FormControl<string>('');
  typeControl = new FormControl<string>('');
  currencyControl = new FormControl<string>('');

  private allRows: CfdiRow[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
  private facturasService: Cliente_Factura
) {}

  ngOnInit(): void {
  this.allRows = this.getDummyRows();
  this.dataSource.data = this.allRows;

  // Aplica filtro por defecto (últimos 30 días)
  //this.applyFilters();

  // Filtro por texto
  this.dataSource.filterPredicate = (row, filterText) => {
    const f = (filterText || '').trim().toLowerCase();
    return [
      row.uuid,
      row.receptorRfc,
      row.receptorNombre,
      `${row.serie}-${row.folio}`
    ].join(' ').toLowerCase().includes(f);
  };

  this.searchInputControl.valueChanges
    .pipe(debounceTime(250), distinctUntilChanged())
    .subscribe(v => {
      this.dataSource.filter = v?.trim().toLowerCase() ?? '';
      this.paginator?.firstPage();
    });
}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  setTimeout(() => {
    this.applyFilters();
  });
  }

  applyFilters(): void {
    console.log(11);
  const params = {
    from: this.fromControl.value?.toISOString(),
    to: this.toControl.value?.toISOString(),
    status: this.statusControl.value || undefined,
    type: this.typeControl.value || undefined,
    currency: this.currencyControl.value || undefined,
    search: this.searchInputControl.value || undefined,
    page: this.paginator.pageIndex + 1,
    pageSize: this.paginator.pageSize
  };
  console.log(params);
  this.isLoading = true;

  this.facturasService.GetFacturas(params).subscribe({
    next: res => {
      this.dataSource.data = res.items;
      this.paginator.length = res.total;
      this.isLoading = false;
    },
    error: () => this.isLoading = false
  });
}

  clearFilters(): void {
    this.fromControl.setValue(this.thirtyDaysAgo);
    this.toControl.setValue(this.today);


    this.statusControl.setValue('');
    this.typeControl.setValue('');
    this.currencyControl.setValue('');

    this.dataSource.data = [...this.allRows];
    this.dataSource.filter = (this.searchInputControl.value || '').trim().toLowerCase();
    this.paginator.firstPage();
  }

  reload(): void {
    // Aquí iría tu llamada a API: GET /api/cfdi
    // Por ahora recarga dummies
    this.isLoading = true;
    setTimeout(() => {
      this.allRows = this.getDummyRows();
      this.dataSource.data = [...this.allRows];
      this.applyFilters();
      this.isLoading = false;
    }, 300);
  }

  // --- Acciones por CFDI ---
  downloadPdf(c: CfdiRow): void {
    // MVP: aquí conecta a tu endpoint: GET /api/cfdi/{id}/pdf
    console.log('Descargar PDF', c.id, c.facturamaId);
  }

  downloadXml(c: CfdiRow): void {
    // MVP: GET /api/cfdi/{id}/xml
    console.log('Descargar XML', c.id, c.facturamaId);
  }

  verDetalle(c: CfdiRow): void {
    // navega a /cfdi/:id o abre modal
    console.log('Ver detalle', c.id);
  }

  reenviarCorreo(c: CfdiRow): void {
    // abre modal de correos
    console.log('Reenviar correo', c.id);
  }

  cancelarCfdi(c: CfdiRow): void {
    // abre modal con motivo SAT + confirma
    console.log('Cancelar CFDI', c.id);
  }

  copiarUuid(c: CfdiRow): void {
    navigator.clipboard.writeText(c.uuid);
  }

  // --- Dummy dataset ---
  private getDummyRows(): CfdiRow[] {
    return [];
  }
}
