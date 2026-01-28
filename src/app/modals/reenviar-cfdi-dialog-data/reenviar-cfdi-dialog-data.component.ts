import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

export interface ReenviarCfdiDialogData {
  uuid: string;
  serie: string;
  folio: string;
  receptorRfc: string;
  total: number;
  estatus: string; // 'TIMBRADO' | 'CANCELADO' etc.
}

export interface ReenviarCfdiDialogResult {
  emailTo?: string | null;
  includeXml: boolean;
  includePdf: boolean;
  includeAcuseCancelacion: boolean;
  subject?: string | null;
  message?: string | null;
}

@Component({
  selector: 'app-reenviar-cfdi-dialog-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './reenviar-cfdi-dialog-data.component.html',
  styleUrl: './reenviar-cfdi-dialog-data.component.scss'
})
export class ReenviarCfdiDialogDataComponent {
form = this.fb.group({
    emailTo: this.fb.control<string | null>(null, [Validators.email]),
    subject: this.fb.control<string | null>(null),
    message: this.fb.control<string | null>(null),

    includePdf: this.fb.control(true, { nonNullable: true }),
    includeXml: this.fb.control(true, { nonNullable: true }),
    includeAcuseCancelacion: this.fb.control(false, { nonNullable: true }),
  });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ReenviarCfdiDialogDataComponent, ReenviarCfdiDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ReenviarCfdiDialogData
  ) {
    // Por default: si está CANCELADO, habilitar acuse
    if (String(data.estatus).toUpperCase() === 'CANCELADO') {
      this.form.controls.includeAcuseCancelacion.setValue(true);
    }
  }

  cancel(): void {
    this.ref.close();
  }

  submit(): void {
    if (this.form.invalid) return;

    // Regla: si no incluye pdf ni xml ni acuse, no mandar
    const v = this.form.getRawValue();
    if (!v.includePdf && !v.includeXml && !v.includeAcuseCancelacion) return;

    // Si no está cancelado, forzar acuse false
    const isCancelado = String(this.data.estatus).toUpperCase() === 'CANCELADO';

    this.ref.close({
      emailTo: v.emailTo?.trim() || null,
      subject: v.subject?.trim() || null,
      message: v.message?.trim() || null,
      includePdf: v.includePdf,
      includeXml: v.includeXml,
      includeAcuseCancelacion: isCancelado ? v.includeAcuseCancelacion : false,
    });
  }

  get canIncludeAcuse(): boolean {
    return String(this.data.estatus).toUpperCase() === 'CANCELADO';
  }
}
