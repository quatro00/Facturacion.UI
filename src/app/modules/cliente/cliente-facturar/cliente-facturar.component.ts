import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
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
import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { forkJoin } from 'rxjs';
import { Cliente_Catalogos } from 'app/services/cliente/cliente_catalogos.service';
import { AlertService } from 'app/services/alert.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

//import { ClientesService } from 'app/core/clientes/clientes.service';
//import { CfdisService } from 'app/core/cfdis/cfdis.service';

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
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './cliente-facturar.component.html',
  styles: [
    /* language=SCSS */
    `
           .col-clave-prod {
  width: 140px;
}

.col-descripcion {
  width: 100%;
  min-width: 320px;
}

.col-cantidad {
  width: 30px;
}

.col-unitario {
  width: 120px;
}

.col-unidad {
  width: 70px;
}

.col-importe {
  width: 120px;
}

.col-acciones {
  width: 70px;
}

:host ::ng-deep .dense .mat-mdc-form-field-infix {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  min-height: 36px;
}

:host ::ng-deep .dense .mat-mdc-text-field-wrapper {
  height: 40px;
}
        `,
  ],
})
export class ClienteFacturarComponent implements OnInit {
  clienteId!: string;
  cliente: any;

  form!: FormGroup;
  isLoading = false;
  isSubmitting = false;

  metodosPago = [];
  formasPago = [];
  monedas = [];
  exportaciones = [];
  usosCfdi = [];
  regimenesFiscales = [];

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
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _fb: FormBuilder,
    private _clientesService: Cliente_Clientes,
    private cliente_catalogos: Cliente_Catalogos,
    private alertService: AlertService,
    //private _cfdisService: CfdisService
  ) { }

  ngOnInit(): void {
    this.form = this._fb.group({
      // Datos del comprobante
      serie: ['a'],
      folio: ['1'],
      fecha: [new Date(), Validators.required],

      // Configuración CFDI (se prellena del cliente si existe)
      usoCfdi: ['', Validators.required],
      formaPago: [''],
      metodoPago: [''],
      moneda: ['MXN', Validators.required],
      exportacion: ['01'], // 01 = No aplica (común)

      // Conceptos
      conceptos: this._fb.array([this.createConcepto()])
    });

    this._route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      this.clienteId = id;
      this.loadData();
      this.cargarClienteYConfig();
    });


  }

  get conceptos(): FormArray {
    return this.form.get('conceptos') as FormArray;
  }

  createConcepto(): FormGroup {
    return this._fb.group({
      claveProdServ: ['14111543', Validators.required],
      descripcion: ['Piedra de tinta', [Validators.required, Validators.maxLength(1000)]],
      cantidad: [1, [Validators.required, Validators.min(0.000001)]],
      valorUnitario: [23, [Validators.required, Validators.min(0)]],
      //claveUnidad: ['H87', Validators.required],
      claveUnidad: ['H87', Validators.required],
      taxObject: ['02'],      // 01 = no objeto, 02 = sí objeto
    ivaRate: [0.16],        // 0.16, 0, null (si no aplica)
    });
  }

  addConcepto(): void {
    this.conceptos.push(this.createConcepto());
    console.log(this.conceptos.length);
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

  get subtotal(): number {
    let sum = 0;
    for (let i = 0; i < this.conceptos.length; i++) sum += this.importeLinea(i);
    return this.round2(sum);
  }

  // En MVP: total = subtotal (luego agregas IVA/retenciones)
  get total(): number {
    return this.subtotal;
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  loadData() {
    forkJoin([
      this.cliente_catalogos.GetRegimenesFiscales(),
      this.cliente_catalogos.GetMetodoPago(),
      this.cliente_catalogos.GetFormaPago(),
      this.cliente_catalogos.GetMoneda(),
      this.cliente_catalogos.GetExportacion(),
      this.cliente_catalogos.GetUsoCfdi(),
    ]).subscribe({
      next: ([
        catRegimenFiscalResponse,
        catMetodoPagoResponse,
        catFormaPagoResponse,
        catMonedaResponse,
        catExportacionResponse,
        catUsosCfdiResponse
      ]) => {
        this.regimenesFiscales = catRegimenFiscalResponse;
        this.metodosPago = catMetodoPagoResponse;
        this.formasPago = catFormaPagoResponse;
        this.monedas = catMonedaResponse;
        this.exportaciones = catExportacionResponse;
        this.usosCfdi = catUsosCfdiResponse
      },
      complete: () => { },
      error: (err) => {
        this.alertService.showError('Error', err.error);
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

          // Prellenado desde clienteconfiguracion si viene en el DTO
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

  emitir(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const conceptos = this.form.value.conceptos ?? [];

  const items = conceptos.map((c: any) => {
    const quantity = Number(c.cantidad || 0);
    const unitPrice = Number(c.valorUnitario || 0);
    const base = Number((quantity * unitPrice).toFixed(2));

    const taxObject = (c.taxObject ?? '02') as string; // "01" o "02"
    const ivaRate = c.ivaRate; // 0.16 | 0 | null

    // Si NO es objeto de impuesto o el usuario eligió "Sin IVA"
    if (taxObject === '01' || ivaRate === null || ivaRate === undefined) {
      return {
        productCode: c.claveProdServ,
        unitCode: c.claveUnidad,
        description: c.descripcion,
        quantity,
        unitPrice,
        taxObject: '01',
        taxes: [] // mejor mandar vacío o no mandar (depende de tu backend)
      };
    }

    // Sí objeto de impuesto
    const ivaTotal = Number((base * Number(ivaRate)).toFixed(2));

    return {
      productCode: c.claveProdServ,
      unitCode: c.claveUnidad,
      description: c.descripcion,
      quantity,
      unitPrice,
      taxObject: '02',
      taxes: [
        {
          name: 'IVA',
          rate: Number(ivaRate), // 0.16 o 0
          base,
          total: ivaTotal
        }
      ]
    };
  });

  const payload = {
    clienteId: this.clienteId,
    serie: this.form.value.serie || null,
    folio: this.form.value.folio || null,
    fecha: this.form.value.fecha,
    cfdiUse: this.form.value.usoCfdi,

    expeditionPlace: this.form.value.expeditionPlace || '', // si lo tienes
    cfdiType: 'I', // o tu valor real
    currency: this.form.value.moneda,
    exportation: this.form.value.exportacion,
    paymentForm: this.form.value.formaPago || null,
    paymentMethod: this.form.value.metodoPago || null,

    items
  };

  console.log(payload);

  this._clientesService.emitirMulti(payload).subscribe({
    next: (res) => console.log(res),
    error: (err) => console.log(err)
  });
}

  cancelar(): void {
    this._router.navigate(['/cliente', 'clientes']);
  }

  private normalizeQuery_Unidad(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    return (v.cClaveUnidad ?? '').toString().trim();
  }

  private normalizeQuery(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    // si llega objeto seleccionado
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
      filter(q => q.length >= 2), // 👈 aquí es 2
      switchMap(q =>
        this.cliente_catalogos.GetClaveUnidad(q, 20).pipe(
          catchError(() => of([]))
        )
      )
    );

    this.claveUnidadOptions.set(i, obs);
    return obs;
  }

  displayClaveUnidad = (x: any | string): string =>
    typeof x === 'string' ? x : `${x.cClaveUnidad} - ${x.nombre}`;

  onSelectClaveUnidad(i: number, item: any): void {
    const fg = this.conceptos.at(i) as FormGroup;

    fg.patchValue({
      claveUnidad: item.cClaveUnidad
    }, { emitEvent: false });
  }

  // Limpia si no selecciona
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

  //--------------------
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
      switchMap(q =>
        this.cliente_catalogos.GetConceptos(q, 20).pipe(
          catchError(() => of([]))
        )
      )
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


  /*
  removeConcepto(index: number): void {
    if (this.conceptos.length === 1) return;
  
    this.conceptos.removeAt(index);
  
    // limpia caché y reconstruye (simple y efectivo)
    this.conceptoOptions.clear();
    // si usas mat-table: this.conceptosTable.renderRows();
  }
    */
}