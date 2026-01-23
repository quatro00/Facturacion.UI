import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, matDialogAnimations, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AreaService } from 'app/services/admin/area.service';
import { AlertService } from 'app/services/alert.service';
import { UsuarioService } from 'app/services/admin/usuario.service';

@Component({
  selector: 'app-area-form',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatFormField,
    MatLabel,
    MatDialogActions,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIcon,
    MatButton,
    MatInputModule,
    CommonModule,
    MatProgressSpinnerModule],
  templateUrl: './area-form.component.html',
  styleUrl: './area-form.component.scss'
})
export class AreaFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean = false;

  responsables = [];

  organizaciones = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AreaFormComponent>,
    private areaService: AreaService,
    private organizacionService: OrganizacionService,
    private usuarioService: UsuarioService,
    private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    this.isEditMode = !!this.data?.id;

    this.form = this.fb.group({
      clave: [this.data?.clave || '', Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      telefono: [this.data?.telefono || '', Validators.required],
      organizacionId: [this.data?.organizacionId || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.organizacionService.GetAll().subscribe((data) => {
      this.organizaciones = data;
    });

  }
  guardar(): void {
    if (this.form.valid) {
      this.form.disable();

      if (this.isEditMode) {
        // MODO EDICIÓN
        const id = this.data.id;
        this.areaService.Update(id, this.form.value).subscribe({
          next: () => {
            this.form.enable();
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.alertService.showError('Error', 'Ocurrió un error inesperado.');
            this.form.enable();
          },
          complete: () => { }
        });
      } else {
        // MODO CREACIÓN
        this.areaService.Crear(this.form.value).subscribe({
          next: () => {
            this.form.reset();
            this.form.enable();
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.form.enable();
            this.alertService.showError('Error', 'Ocurrió un error inesperado.');
          },
          complete: () => { }
        });
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
