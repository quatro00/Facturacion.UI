import { Component, Inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface CancelCfdiDialogData {
  uuid?: string;
  serie?: string;
  folio?: string;
  receptorRfc?: string;
  total?: number;
}
export type SatCancelMotive = '01' | '02' | '03' | '04';

export interface CancelCfdiDialogResult {
  motive: SatCancelMotive;
  uuidReplacement?: string | null;
}

@Component({
  selector: 'app-cancel-cfdi-dialog',
  imports: [
    MatDialogModule,
    CommonModule, NgFor, NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cancel-cfdi-dialog.component.html',
  styleUrl: './cancel-cfdi-dialog.component.scss'
})
export class CancelCfdiDialogComponent {
 motives: Array<{ value: SatCancelMotive; label: string; help: string }> = [
    { value: '01', label: '01 - Comprobante emitido con errores con relación', help: 'Requiere UUID del CFDI que sustituye.' },
    { value: '02', label: '02 - Comprobante emitido con errores sin relación', help: 'No requiere sustitución.' },
    { value: '03', label: '03 - No se llevó a cabo la operación', help: 'No requiere sustitución.' },
    { value: '04', label: '04 - Operación nominativa relacionada en una factura global', help: 'No requiere sustitución.' },
  ];

  form = this.fb.group({
    motive: this.fb.control<SatCancelMotive>('02', { nonNullable: true, validators: [Validators.required] }),
    uuidReplacement: this.fb.control<string | null>(null),
    confirm: this.fb.control<boolean>(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<CancelCfdiDialogComponent, CancelCfdiDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CancelCfdiDialogData
  ) {
    // si cambia a 01, exigir UUID sustitución
    this.form.controls.motive.valueChanges.subscribe((m) => {
      const ctrl = this.form.controls.uuidReplacement;

      if (m === '01') {
        ctrl.addValidators([Validators.required, Validators.pattern(/^[0-9a-fA-F-]{36}$/)]);
      } else {
        ctrl.clearValidators();
        ctrl.setValue(null);
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  get selectedMotiveHelp(): string {
  const m = this.form.controls.motive.value;
  return this.motives.find(x => x.value === m)?.help ?? '';
}

  cancel(): void {
    this.ref.close();
  }

  submit(): void {
    if (this.form.invalid) return;

    const motive = this.form.controls.motive.value;
    const uuidReplacement = this.form.controls.uuidReplacement.value;

    this.ref.close({
      motive,
      uuidReplacement: motive === '01' ? uuidReplacement : null,
    });
  }
}
