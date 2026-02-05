import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { AlertService } from 'app/services/alert.service';

// ✅ Emisor
import { EmisorService, EmisorLite } from 'app/core/emisor/emisor.service';
import { Cliente_Perfil } from 'app/services/cliente/cliente_perfil.service';
import { Cliente_Sucursal } from 'app/services/cliente/cliente_sucursal.service';

@Component({
  selector: 'app-cliente-facturar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSnackBarModule,
  ],
  templateUrl: './cliente-facturar.component.html',
  styles: [
    `
      .col-clave-prod { width: 140px; }
      .col-descripcion { width: 100%; min-width: 320px; }
      .col-cantidad { width: 30px; }
      .col-unitario { width: 120px; }
      .col-unidad { width: 70px; }
      .col-importe { width: 120px; }
      .col-acciones { width: 70px; }
    `,
  ],
})
export class ClienteFacturarComponent implements OnInit, OnDestroy {

  isLoadingSerieFolio = false;
  serieFolioWarning: string | null = null;

  private _serieFolioSub?: Subscription;

  sucursales: any[] = [];

  clienteId!: string;
  cliente: any;

  form!: FormGroup;
  isLoading = false;
  isSubmitting = false;

  metodosPago: any[] = [];
  formasPago: any[] = [];
  monedas: any[] = [];
  exportaciones: any[] = [];
  usosCfdi: any[] = [];
  regimenesFiscales: any[] = [];

  conceptoOptions = new Map<number, Observable<any>>();
  claveUnidadOptions = new Map<number, Observable<any>>();

  displayedColumns = [
    'claveProdServ',
    'descripcion',
    'cantidad',
    'valorUnitario',
    'claveUnidad',
    'taxObject',
    'ivaRate',
    'importe',
    'acciones'
  ];

  @ViewChild('conceptosTable') conceptosTable!: MatTable<any>;

  // ✅ Emisor seleccionado
  emisores: EmisorLite[] = [];
  selectedEmisor: EmisorLite | null = null;
  private _emisorSub?: Subscription;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _fb: FormBuilder,
    private _clientesService: Cliente_Clientes,
    private cliente_catalogos: Cliente_Catalogos,
    private _sucursalService: Cliente_Sucursal,
    private alertService: AlertService,

    // ✅ snackbar
    private _snackBar: MatSnackBar,

    // ✅ emisor
    private _emisorService: EmisorService,
    private _perfil: Cliente_Perfil,
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      tipoIngreso: ['I_MERCANCIAS', Validators.required],
      sucursalId: ['', Validators.required],
      serie: [''],
      folio: [''],
      fecha: [new Date(), Validators.required],

      usoCfdi: ['', Validators.required],
      formaPago: [''],
      metodoPago: [''],
      moneda: ['MXN', Validators.required],
      exportacion: ['01'],

      conceptos: this._fb.array([this.createConcepto()])
    });

    this.bindSerieFolioAuto();

    // Load route params
    this._route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      this.clienteId = id;

      this.loadData();
      this.cargarClienteYConfig();

      // ✅ Load emisores + subscribe a cambios
      this.loadEmisoresYBind();
    });
  }

  private bindSerieFolioAuto(): void {
    this._serieFolioSub?.unsubscribe();

    const tipoCtrl = this.form.get('tipoIngreso')!;
    const sucCtrl = this.form.get('sucursalId')!;

    this._serieFolioSub = tipoCtrl.valueChanges
      .pipe(startWith(tipoCtrl.value))
      .subscribe(() => this.tryLoadSerieFolio());

    // también en cambios de sucursal
    sucCtrl.valueChanges
      .pipe(startWith(sucCtrl.value))
      .subscribe(() => this.tryLoadSerieFolio());
  }

  private tryLoadSerieFolio(): void {
    this.serieFolioWarning = null;

    const emisorId = this._emisorService.emisorId;
    const sucursalId = this.form.get('sucursalId')?.value;
    const concepto = this.form.get('tipoIngreso')?.value;

    // Limpia si falta algo
    if (!emisorId || !sucursalId || !concepto) {
      this.form.patchValue({ serie: '', folio: '' }, { emitEvent: false });
      return;
    }

    this.isLoadingSerieFolio = true;

    this._sucursalService.GetSerieFolioSiguiente(sucursalId, concepto)
      .pipe(finalize(() => (this.isLoadingSerieFolio = false)))
      .subscribe({
        next: (res) => {
          // res: { serie, folio, expeditionPlace? }
          this.form.patchValue(
            { serie: res.serie ?? '', folio: (res.folio ?? '').toString() },
            { emitEvent: false }
          );

          if (!res.serie) {
            this.serieFolioWarning =
              'No hay serie configurada para este tipo de factura en la sucursal. Configúrala en “Series por sucursal”.';
          }
        },
        error: (err) => {
          this.form.patchValue({ serie: '', folio: '' }, { emitEvent: false });
          this.serieFolioWarning = err?.error?.message
            ?? 'No se pudo determinar la serie/folio. Verifica la configuración de series.';
        }
      });
  }

  ngOnDestroy(): void {
    this._emisorSub?.unsubscribe();
    this._serieFolioSub?.unsubscribe();
  }

  private loadSucursalesPorEmisor(razonSocialId: string | null): void {
    // reset
    this.sucursales = [];
    this.form.patchValue({ sucursalId: '' }, { emitEvent: false });

    if (!razonSocialId) return;

    this._sucursalService.GetSucursales({
      RazonSocialId: razonSocialId,
      Status: 'ACTIVE',
      Page: 1,
      PageSize: 200,
      Sort: 'codigo',
      Dir: 'asc'
    }).subscribe({
      next: (res) => {
        this.sucursales = res?.items ?? [];

        // ✅ opcional: si solo hay 1, autoseleccionar
        if (this.sucursales.length === 1) {
          this.form.patchValue({ sucursalId: this.sucursales[0].id }, { emitEvent: false });
        }
      },
      error: (err) => {
        console.error(err);
        this._snackBar.open('No se pudieron cargar las sucursales del emisor.', 'OK', { duration: 3500 });
      }
    });
  }

  // ----------------------------
  // ✅ Emisor handling
  // ----------------------------
  private loadEmisoresYBind(): void {
    this._perfil.GetRazonesSociales().subscribe({
      next: (list: any[]) => {
        this.emisores = (list || []).filter(x => x.activo !== false);

        // Selección inicial
        this.resolveSelectedEmisor(this._emisorService.emisorId);

        // Escuchar cambios
        this._emisorSub?.unsubscribe();
        this._emisorSub = this._emisorService.emisorId$.subscribe((id) => {
          const prevId = this.selectedEmisor?.id ?? null;

          this.resolveSelectedEmisor(id);

          // ✅ aquí te enteras del cambio del switcher
          this.loadSucursalesPorEmisor(id);
          //merol
          this.form.patchValue({ sucursalId: '', serie: '', folio: '' }, { emitEvent: false });
          this.serieFolioWarning = null;

          // Si cambió y ya había uno seleccionado, limpia
          if (prevId && id && id !== prevId) {
            this.resetFormPorCambioEmisor();
          }
        });
        this.resolveSelectedEmisor(this._emisorService.emisorId);
        this.loadSucursalesPorEmisor(this._emisorService.emisorId);

        //merol
        this.form.patchValue({ sucursalId: '', serie: '', folio: '' }, { emitEvent: false });
        this.serieFolioWarning = null;
      },
      error: () => {
        this.selectedEmisor = null;
      }
    });

  }

  private resolveSelectedEmisor(id: string | null): void {
    if (!id) {
      this.selectedEmisor = null;
      return;
    }
    this.selectedEmisor = this.emisores.find(x => x.id === id) ?? null;
  }

  private resetFormPorCambioEmisor(): void {
    // Limpia form con defaults
    this.form.reset({
      serie: '',
      folio: '',
      fecha: new Date(),
      usoCfdi: '',
      formaPago: '',
      metodoPago: '',
      moneda: 'MXN',
      exportacion: '01',
    });

    // Reset conceptos: deja 1
    while (this.conceptos.length) this.conceptos.removeAt(0);
    this.conceptos.push(this.createConcepto());

    this.conceptoOptions.clear();
    this.claveUnidadOptions.clear();

    // Si tu tabla existe, re-render
    queueMicrotask(() => this.conceptosTable?.renderRows());

    // ✅ Snackbar aviso
    this._snackBar.open(
      'Se cambió la razón social (emisor). Se limpió el formulario.',
      'OK',
      { duration: 3500 }
    );
  }

  // ----------------------------
  // Form helpers
  // ----------------------------
  get conceptos(): FormArray {
    return this.form.get('conceptos') as FormArray;
  }

  createConcepto(): FormGroup {
    return this._fb.group({
      claveProdServ: ['14111543', Validators.required],
      descripcion: ['Piedra de tinta', [Validators.required, Validators.maxLength(1000)]],
      cantidad: [1, [Validators.required, Validators.min(0.000001)]],
      valorUnitario: [23, [Validators.required, Validators.min(0)]],
      claveUnidad: ['H87', Validators.required],
      taxObject: ['02'],
      ivaRate: [0.16],
    });
  }

  addConcepto(): void {
    this.conceptos.push(this.createConcepto());
    this.conceptosTable.renderRows();
  }

  removeConcepto(index: number): void {
    if (this.conceptos.length === 1) return;
    this.conceptos.removeAt(index);
    this.conceptoOptions.clear();
    this.claveUnidadOptions.clear();
    this.conceptosTable.renderRows();
  }

  importeLinea(i: number): number {
    const g = this.conceptos.at(i) as FormGroup;
    const cantidad = Number(g.get('cantidad')?.value ?? 0);
    const unitario = Number(g.get('valorUnitario')?.value ?? 0);
    return this.round2(cantidad * unitario);
  }

  private getNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private lineBase(i: number): number {
    const g = this.conceptos.at(i) as FormGroup;
    const cantidad = this.getNumber(g.get('cantidad')?.value);
    const unitario = this.getNumber(g.get('valorUnitario')?.value);
    return this.round2(cantidad * unitario);
  }

  private lineIva(i: number): number {
    const g = this.conceptos.at(i) as FormGroup;

    const taxObject = (g.get('taxObject')?.value ?? '02') as string;
    const rate = g.get('ivaRate')?.value;

    if (taxObject !== '02') return 0;
    if (rate === null || rate === undefined || rate === '') return 0;

    const ivaRate = this.getNumber(rate); // 0.16 o 0
    if (ivaRate <= 0) return 0;

    const base = this.lineBase(i);
    return this.round2(base * ivaRate);
  }

  get subtotal(): number {
    let sum = 0;
    for (let i = 0; i < this.conceptos.length; i++) sum += this.lineBase(i);
    return this.round2(sum);
  }

  get totalIva(): number {
    let sum = 0;
    for (let i = 0; i < this.conceptos.length; i++) sum += this.lineIva(i);
    return this.round2(sum);
  }

  get total(): number {
    // Aquí en el futuro puedes restar retenciones y sumar IEPS
    return this.round2(this.subtotal + this.totalIva);
  }
  /*
    get subtotal(): number {
      let sum = 0;
      for (let i = 0; i < this.conceptos.length; i++) sum += this.importeLinea(i);
      return this.round2(sum);
    }
  
    get total(): number {
      return this.subtotal;
    }
    */

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  // ----------------------------
  // Load catalogs + client
  // ----------------------------
  loadData(): void {
    forkJoin([
      this.cliente_catalogos.GetRegimenesFiscales(),
      this.cliente_catalogos.GetMetodoPago(),
      this.cliente_catalogos.GetFormaPago(),
      this.cliente_catalogos.GetMoneda(),
      this.cliente_catalogos.GetExportacion(),
      this.cliente_catalogos.GetUsoCfdi(),
    ]).subscribe({
      next: ([reg, met, fp, mon, exp, usos]) => {
        this.regimenesFiscales = reg;
        this.metodosPago = met;
        this.formasPago = fp;
        this.monedas = mon;
        this.exportaciones = exp;
        this.usosCfdi = usos;
      },
      error: (err) => {
        this.alertService.showError('Error', err?.error ?? 'No se pudieron cargar catálogos');
      }
    });
  }

  cargarClienteYConfig(): void {
    this.isLoading = true;

    this._clientesService.GetById(this.clienteId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.cliente = data;

          this.form.patchValue({
            usoCfdi: data.usoCfdi ?? '',
            formaPago: data.formaPago ?? '',
            metodoPago: data.metodoPago ?? '',
            moneda: data.moneda ?? 'MXN',
            exportacion: data.exportacion ?? '01',
          });
        },
        error: (e) => console.error(e),
      });
  }

  // ----------------------------
  // ✅ Emitir
  // ----------------------------
  emitir(): void {
    // ✅ valida emisor
    const emisorId = this._emisorService.emisorId;
    const sucursalId = this.form.value.sucursalId;
    if (!sucursalId) {
      this._snackBar.open('Selecciona una sucursal para emitir.', 'OK', { duration: 3500 });
      return;
    }

    if (!emisorId) {
      this._snackBar.open('Selecciona un emisor antes de emitir.', 'OK', { duration: 3500 });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const conceptos = this.form.value.conceptos ?? [];

    const items = conceptos.map((c: any) => {
      const quantity = Number(c.cantidad || 0);
      const unitPrice = Number(c.valorUnitario || 0);
      const base = Number((quantity * unitPrice).toFixed(2));

      const taxObject = (c.taxObject ?? '02') as string;
      const ivaRate = c.ivaRate;

      if (taxObject === '01' || ivaRate === null || ivaRate === undefined) {
        return {
          productCode: c.claveProdServ,
          unitCode: c.claveUnidad,
          description: c.descripcion,
          quantity,
          unitPrice,
          taxObject: '01',
          taxes: []
        };
      }

      const ivaTotal = Number((base * Number(ivaRate)).toFixed(2));

      return {
        productCode: c.claveProdServ,
        unitCode: c.claveUnidad,
        description: c.descripcion,
        quantity,
        unitPrice,
        taxObject: '02',
        taxes: [{ name: 'IVA', rate: Number(ivaRate), base, total: ivaTotal }]
      };
    });

    const payload = {
      razonSocialId: emisorId,
      sucursalId: sucursalId,
      tipoFactura: this.form.value.tipoIngreso,
      clienteId: this.clienteId,
      serie: this.form.value.serie || null,
      folio: this.form.value.folio || null,
      fecha: this.form.value.fecha,
      cfdiUse: this.form.value.usoCfdi,
      expeditionPlace: this.form.value.expeditionPlace || '',
      cfdiType: 'I',
      currency: this.form.value.moneda,
      exportation: this.form.value.exportacion,
      paymentForm: this.form.value.formaPago || null,
      paymentMethod: this.form.value.metodoPago || null,
      items
    };

    this.isSubmitting = true;

    this._clientesService.emitir(payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (res) => {
        this._snackBar.open('Factura emitida correctamente', 'OK', { duration: 3500 });
        console.log(res);
      },
      error: (err) => {
        this._snackBar.open(err?.error?.message ?? 'Error al emitir', 'OK', { duration: 4500 });
        console.log(err);
      }
    });
  }

  cancelar(): void {
    this._router.navigate(['/cliente', 'clientes']);
  }

  // ----------------------------
  // Autocomplete helpers (los tuyos tal cual)
  // ----------------------------
  private normalizeQuery_Unidad(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    return (v.cClaveUnidad ?? '').toString().trim();
  }

  private normalizeQuery(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    return (v.cClaveProdServ ?? '').toString().trim();
  }

  getClaveUnidadOptions(i: number): Observable<any> {
    if (this.claveUnidadOptions.has(i)) return this.claveUnidadOptions.get(i)!;

    const fg = this.conceptos.at(i) as FormGroup;
    const ctrl = fg.get('claveUnidad')!;

    const obs = ctrl.valueChanges.pipe(
      startWith(ctrl.value),
      map(v => this.normalizeQuery_Unidad(v)),
      debounceTime(250),
      distinctUntilChanged(),
      filter(q => q.length >= 2),
      switchMap(q => this.cliente_catalogos.GetClaveUnidad(q, 20).pipe(catchError(() => of([]))))
    );

    this.claveUnidadOptions.set(i, obs);
    return obs;
  }

  displayClaveUnidad = (x: any | string): string =>
    typeof x === 'string' ? x : `${x.cClaveUnidad} - ${x.nombre}`;

  onSelectClaveUnidad(i: number, item: any): void {
    const fg = this.conceptos.at(i) as FormGroup;
    fg.patchValue({ claveUnidad: item.cClaveUnidad }, { emitEvent: false });
  }

  onClaveUnidadBlur(i: number): void {
    const fg = this.conceptos.at(i) as FormGroup;
    const ctrl = fg.get('claveUnidad');
    if (!ctrl) return;

    const value = ctrl.value;
    if (typeof value === 'string') {
      fg.patchValue({ claveUnidad: '' }, { emitEvent: false });
      ctrl.markAsTouched();
    }
  }

  getConceptoOptions(i: number): Observable<any> {
    if (this.conceptoOptions.has(i)) return this.conceptoOptions.get(i)!;

    const fg = this.conceptos.at(i) as FormGroup;
    const ctrl = fg.get('claveProdServ')!;

    const obs = ctrl.valueChanges.pipe(
      startWith(ctrl.value),
      map(v => this.normalizeQuery(v)),
      debounceTime(250),
      distinctUntilChanged(),
      filter(q => q.length >= 3),
      switchMap(q => this.cliente_catalogos.GetConceptos(q, 20).pipe(catchError(() => of([]))))
    );

    this.conceptoOptions.set(i, obs);
    return obs;
  }

  displayConcepto = (c: any | string): string =>
    typeof c === 'string' ? c : `${c.cClaveProdServ} - ${c.descripcion}`;

  onSelectConcepto(i: number, item: any): void {
    const fg = this.conceptos.at(i) as FormGroup;
    fg.patchValue({
      claveProdServ: item.cClaveProdServ,
      descripcion: item.descripcion
    }, { emitEvent: false });
  }
}