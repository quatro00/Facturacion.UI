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
import { debounceTime, distinctUntilChanged, finalize, forkJoin, filter } from 'rxjs';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { SeleccionAreaComponent } from 'app/modals/seleccion-area/seleccion-area.component';
import { TicketService } from 'app/services/admin/ticket.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
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
import { HttpResponse } from '@angular/common/http';
import { CancelCfdiDialogComponent } from 'app/modals/cancel-cfdi-dialog/cancel-cfdi-dialog.component';
import { ReenviarCfdiDialogDataComponent, ReenviarCfdiDialogResult } from 'app/modals/reenviar-cfdi-dialog-data/reenviar-cfdi-dialog-data.component';


type CfdiStatus = 'Activo' | 'CANCELADO';

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


  isDownloadingXml = false;
  isDownloadingPdf = false;
  isDownloadingAcuse = false;
  cancelandoId: string | null = null;
  isSendingEmail = false;

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
    private facturasService: Cliente_Factura,
    private dialog: MatDialog
  ) { }

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
    this.isDownloadingPdf = true;

    // Usa el Id correcto para Facturama
    const idToDownload = c.facturamaId; // o c.id si tu backend resuelve

    this.facturasService.downloadPdf(idToDownload, 'issued') // o 'issuedLite' si aplica
      .pipe(finalize(() => (this.isDownloadingPdf = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => {
          const filenameFromServer = this.getFilenameFromContentDisposition(
            resp.headers.get('content-disposition')
          );

          const filename = filenameFromServer ?? this.buildPdfFilename(c);

          // Asegura que siempre haya un Blob
          const blob = resp.body ?? new Blob([], { type: 'application/pdf' });
          this.saveBlob(blob, filename);
        },
        error: (err) => {
          console.error(err);
          // this.snack.open('No se pudo descargar el PDF', 'Cerrar', { duration: 3500 });
        },
      });
  }

  private buildPdfFilename(c: CfdiRow): string {
    const serieFolio = `${(c.serie ?? '').trim()}${(c.folio ?? '').trim()}` || 'SIN_FOLIO';
    const uuidShort = (c.uuid ?? '').trim() ? c.uuid.trim().slice(0, 8) : 'SIN_UUID';
    const rfc = (c.receptorRfc ?? '').trim() || 'SIN_RFC';

    // CFDI_A001234_RFC_XAXX010101000_UUID_1234ABCD.pdf
    return `CFDI_${serieFolio}_${rfc}_UUID_${uuidShort}.pdf`;
  }

  downloadAcuse(c: CfdiRow): void {
  // Seguridad extra en UI
  if (c.estatus !== 'CANCELADO') {
    return;
  }

  this.isDownloadingAcuse = true;

  this.facturasService.downloadAcuse(c.id)
    .pipe(finalize(() => (this.isDownloadingAcuse = false)))
    .subscribe({
      next: (blob: Blob) => {
        const filename = `ACUSE_CANCELACION_${c.uuid}.xml`;
        this.saveBlob(blob, filename);
      },
      error: (err) => {
        console.error(err);
        // Opcional UX
        // this.snack.open('No se pudo descargar el acuse de cancelación', 'Cerrar', { duration: 3000 });
      }
    });
}

  downloadXml(c: CfdiRow): void {
    this.isDownloadingXml = true;
    const idToDownload = c.facturamaId; // o c.id

    this.facturasService.downloadXml(idToDownload, 'issued')
      .pipe(finalize(() => (this.isDownloadingXml = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => {
          const filenameFromServer = this.getFilenameFromContentDisposition(
            resp.headers.get('content-disposition')
          );

          const filename = filenameFromServer ?? this.buildXmlFilename(c);
          this.saveBlob(resp.body!, filename);
        },
        error: (err) => {
          console.error(err);
          //this.snack.open('No se pudo descargar el XML', 'Cerrar', { duration: 3500 });
        },
      });
  }

  verDetalle(c: CfdiRow): void {
    // navega a /cfdi/:id o abre modal
    console.log('Ver detalle', c.id);
  }

  reenviarCorreo(c: CfdiRow): void {
  const ref = this.dialog.open(ReenviarCfdiDialogDataComponent, {
    width: '560px',
    disableClose: true,
    data: {
      uuid: c.uuid,
      serie: c.serie,
      folio: c.folio,
      receptorRfc: c.receptorRfc,
      total: c.total,
      estatus: c.estatus,
    }
  });

  ref.afterClosed()
    .pipe(filter((r: ReenviarCfdiDialogResult | undefined | null): r is ReenviarCfdiDialogResult => !!r))
    .subscribe((result) => {
      this.isSendingEmail = true;

      this.facturasService.reenviarCfdi(c.id, {
        emailTo: result.emailTo ?? null,
        includePdf: result.includePdf,
        includeXml: result.includeXml,
        includeAcuseCancelacion: result.includeAcuseCancelacion,
        subject: result.subject ?? null,
        message: result.message ?? null,
      })
      .pipe(finalize(() => (this.isSendingEmail = false)))
      .subscribe({
        next: (resp) => {
          console.log('Reenvío OK', resp);
          // si usas snack:
          // this.snack.open(`Enviado a ${resp.to}`, 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          // this.snack.open('No se pudo reenviar el CFDI', 'Cerrar', { duration: 3500 });
        },
      });
    });
}

  cancelarCfdi(c: CfdiRow): void {
    const ref = this.dialog.open(CancelCfdiDialogComponent, {
      width: '520px',
      disableClose: true,
      data: {
        uuid: c.uuid,
        serie: c.serie,
        folio: c.folio,
        receptorRfc: c.receptorRfc,
        total: c.total,
      }
    });

    ref.afterClosed()
      .pipe(filter((r) => r != null))
      .subscribe((result: any) => {
        this.cancelandoId = c.id;

        this.facturasService.cancelCfdi(c.id, {
          motive: result.motive,
          uuidReplacement: result.uuidReplacement ?? null,
        })
          .pipe(finalize(() => (this.cancelandoId = null)))
          .subscribe({
            next: (r) => {
              // Ajusta al nombre real de tu estatus en UI
              const s = (r.status ?? '').toLowerCase();
              if (s === 'canceled' || s === 'cancelled') c.estatus = 'CANCELADO' as any;
              else if (s === 'requested') c.estatus = 'CANCELACION_SOLICITADA' as any;
              else if (s === 'rejected') c.estatus = 'CANCELACION_RECHAZADA' as any;

              // opcional: refrescar grid desde backend si prefieres
              // this.loadFacturas();

              console.log('Cancelación OK', r);
            },
            error: (err) => {
              console.error(err);
            }
          });
      });
  }

  copiarUuid(c: CfdiRow): void {
    navigator.clipboard.writeText(c.uuid);
  }

  //----------------descargar facturas
  private buildXmlFilename(c: CfdiRow): string {
    const serieFolio = `${(c.serie ?? '').trim()}${(c.folio ?? '').trim()}` || 'SIN_FOLIO';
    const uuidShort = (c.uuid ?? '').trim() ? c.uuid.trim().slice(0, 8) : 'SIN_UUID';
    const rfc = (c.receptorRfc ?? '').trim() || 'SIN_RFC';
    return `CFDI_${serieFolio}_${rfc}_UUID_${uuidShort}.xml`;
  }
  getFilenameFromContentDisposition(cd: string | null): string | null {
    if (!cd) return null;

    // filename*=UTF-8''CFDI_123.xml
    const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
    if (utf8?.[1]) return decodeURIComponent(utf8[1]);

    // filename="CFDI_123.xml"
    const ascii = /filename\s*=\s*\"?([^\";]+)\"?/i.exec(cd);
    return ascii?.[1] ?? null;
  }

  saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }
  // --- Dummy dataset ---
  private getDummyRows(): CfdiRow[] {
    return [];
  }
}
