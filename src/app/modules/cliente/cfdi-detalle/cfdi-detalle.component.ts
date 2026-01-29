import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, forkJoin, filter, switchMap } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CfdiConceptoDto } from 'app/shared/models/cliente_facturacion/CfdiConceptoDto';
import { CfdiDetalleDto } from 'app/shared/models/cliente_facturacion/CfdiDetalleDto';
import { Cliente_Factura } from 'app/services/cliente/cliente_factura.service';
import { MatDialog } from '@angular/material/dialog';
import { ReenviarCfdiDialogDataComponent } from 'app/modals/reenviar-cfdi-dialog-data/reenviar-cfdi-dialog-data.component';
import { ReenviarCfdiDialogResult } from 'app/shared/models/cliente_facturacion/ReenviarCfdi.models';
import { CancelCfdiDialogComponent } from 'app/modals/cancel-cfdi-dialog/cancel-cfdi-dialog.component';


@Component({
  selector: 'app-cfdi-detalle',
  imports: [
    CommonModule,
    RouterModule,

    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './cfdi-detalle.component.html',
  styleUrl: './cfdi-detalle.component.scss'
})
export class CfdiDetalleComponent {
  private route = inject(ActivatedRoute);
  private facturasService = inject(Cliente_Factura);
  private dialog = inject(MatDialog);

  isLoading = true;
  cfdi: CfdiDetalleDto | null = null;
  isDownloadingXml = false;
  isDownloadingPdf = false;
  isDownloadingAcuse = false;
  cancelandoId: string | null = null;
  isSendingEmail = false;

  displayedColumns: string[] = ['cantidad', 'descripcion', 'valorUnitario', 'descuento', 'importe'];

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((p) => this.facturasService.getCfdiDetalle(p.get('id')!)),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          console.log("nexo");
          console.log(data);
          this.cfdi = data
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error', err);
          this.cfdi = null;
        },
      });
  }

  // ===== Helpers UI =====
  get statusLabel(): string {
    const s = (this.cfdi?.estatus ?? '').toUpperCase();
    return s || '—';
  }

  get isCancelado(): boolean {
    return (this.cfdi?.estatus ?? '').toUpperCase() === 'CANCELADO';
  }

  get canCancelar(): boolean {
    const s = (this.cfdi?.estatus ?? '').toUpperCase();
    return s === 'TIMBRADO' || s === 'ACTIVO'; // ajusta según tu catálogo
  }

  // ===== Acciones =====

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

  getFilenameFromContentDisposition(cd: string | null): string | null {
    if (!cd) return null;

    // filename*=UTF-8''CFDI_123.xml
    const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
    if (utf8?.[1]) return decodeURIComponent(utf8[1]);

    // filename="CFDI_123.xml"
    const ascii = /filename\s*=\s*\"?([^\";]+)\"?/i.exec(cd);
    return ascii?.[1] ?? null;
  }

  private buildXmlFilename(): string {
    const serieFolio = `${(this.cfdi.serie ?? '').trim()}${(this.cfdi.folio ?? '').trim()}` || 'SIN_FOLIO';
    const uuidShort = (this.cfdi.uuid ?? '').trim() ? this.cfdi.uuid.trim().slice(0, 8) : 'SIN_UUID';
    const rfc = (this.cfdi.rfcReceptor ?? '').trim() || 'SIN_RFC';
    return `CFDI_${serieFolio}_${rfc}_UUID_${uuidShort}.xml`;
  }

  private buildPdfFilename(): string {
    const serieFolio = `${(this.cfdi.serie ?? '').trim()}${(this.cfdi.folio ?? '').trim()}` || 'SIN_FOLIO';
    const uuidShort = (this.cfdi.uuid ?? '').trim() ? this.cfdi.uuid.trim().slice(0, 8) : 'SIN_UUID';
    const rfc = (this.cfdi.rfcReceptor ?? '').trim() || 'SIN_RFC';

    // CFDI_A001234_RFC_XAXX010101000_UUID_1234ABCD.pdf
    return `CFDI_${serieFolio}_${rfc}_UUID_${uuidShort}.pdf`;
  }

  downloadXml(): void {
    if (!this.cfdi) return;
    this.isDownloadingXml = true;
    const idToDownload = this.cfdi.facturamaId; // o c.id

    this.facturasService.downloadXml(idToDownload, 'issued')
      .pipe(finalize(() => (this.isDownloadingXml = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => {
          const filenameFromServer = this.getFilenameFromContentDisposition(
            resp.headers.get('content-disposition')
          );

          const filename = filenameFromServer ?? this.buildXmlFilename();
          this.saveBlob(resp.body!, filename);
        },
        error: (err) => {
          console.error(err);
          //this.snack.open('No se pudo descargar el XML', 'Cerrar', { duration: 3500 });
        },
      });
  }

  downloadPdf(): void {
    this.isDownloadingPdf = true;

    // Usa el Id correcto para Facturama
    const idToDownload = this.cfdi.facturamaId; // o c.id si tu backend resuelve

    this.facturasService.downloadPdf(idToDownload, 'issued') // o 'issuedLite' si aplica
      .pipe(finalize(() => (this.isDownloadingPdf = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => {
          const filenameFromServer = this.getFilenameFromContentDisposition(
            resp.headers.get('content-disposition')
          );

          const filename = filenameFromServer ?? this.buildPdfFilename();

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

  downloadAcuse(): void {
    if (!this.cfdi) return;

    // Seguridad extra en UI
    if (this.cfdi.estatus !== 'CANCELADO') {
      return;
    }

    this.isDownloadingAcuse = true;

    this.facturasService.downloadAcuse(this.cfdi.id)
      .pipe(finalize(() => (this.isDownloadingAcuse = false)))
      .subscribe({
        next: (blob: Blob) => {
          const filename = `ACUSE_CANCELACION_${this.cfdi.uuid}.xml`;
          this.saveBlob(blob, filename);
        },
        error: (err) => {
          console.error(err);
          // Opcional UX
          // this.snack.open('No se pudo descargar el acuse de cancelación', 'Cerrar', { duration: 3000 });
        }
      });
  }

  reenviarCorreo(): void {
    if (!this.cfdi) return;
    
    const ref = this.dialog.open(ReenviarCfdiDialogDataComponent, {
          width: '560px',
          disableClose: true,
          data: {
            uuid: this.cfdi.uuid,
            serie: this.cfdi.serie,
            folio: this.cfdi.folio,
            receptorRfc: this.cfdi.rfcReceptor,
            total: this.cfdi.total,
            estatus: this.cfdi.estatus,
          }
        });
    
        ref.afterClosed()
          .pipe(filter((r: ReenviarCfdiDialogResult | undefined | null): r is ReenviarCfdiDialogResult => !!r))
          .subscribe((result) => {
            this.isSendingEmail = true;
    
            this.facturasService.reenviarCfdi(this.cfdi.id, {
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

  cancelarCfdi(): void {
    if (!this.cfdi) return;
    
    const ref = this.dialog.open(CancelCfdiDialogComponent, {
          width: '520px',
          disableClose: true,
          data: {
            uuid: this.cfdi.uuid,
            serie: this.cfdi.serie,
            folio: this.cfdi.folio,
            receptorRfc: this.cfdi.rfcReceptor,
            total: this.cfdi.total,
          }
        });
    
        ref.afterClosed()
          .pipe(filter((r) => r != null))
          .subscribe((result: any) => {
            this.cancelandoId = this.cfdi.id;
    
            this.facturasService.cancelCfdi(this.cfdi.id, {
              motive: result.motive,
              uuidReplacement: result.uuidReplacement ?? null,
            })
              .pipe(finalize(() => (this.cancelandoId = null)))
              .subscribe({
                next: (r) => {
                  // Ajusta al nombre real de tu estatus en UI
                  const s = (r.status ?? '').toLowerCase();
                  if (s === 'canceled' || s === 'cancelled') this.cfdi.estatus = 'CANCELADO' as any;
                  else if (s === 'requested') this.cfdi.estatus = 'CANCELACION_SOLICITADA' as any;
                  else if (s === 'rejected') this.cfdi.estatus = 'CANCELACION_RECHAZADA' as any;
    
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

  trackById(_: number, x: CfdiConceptoDto): string {
    return x.id;
  }
}
