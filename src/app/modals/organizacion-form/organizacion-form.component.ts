import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, matDialogAnimations, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-organizacion-form',
  templateUrl: './organizacion-form.component.html',
  imports: [
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
    MatProgressSpinnerModule]
})
export class OrganizacionFormComponent {
  form: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrganizacionFormComponent>,
    private organizacionService: OrganizacionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.isEditMode = !!this.data?.id;

    this.form = this.fb.group({
      clave: [this.data?.clave || '', Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      telefono: [this.data?.telefono || '', Validators.required],
      direccion: [this.data?.direccion || '', Validators.required],
      responsable: [this.data?.responsable || '', Validators.required],
    });
  }

  save(): void {
  if (this.form.valid) {
    this.form.disable();
    
    if (this.isEditMode) {
      // MODO EDICIÓN
      const id = this.data.id;
      this.organizacionService.Update(id, this.form.value).subscribe({
        next: () => {
          this.form.enable();
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.form.enable();
        },
        complete: () => {}
      });
    } else {
      // MODO CREACIÓN
      this.organizacionService.Crear(this.form.value).subscribe({
        next: () => {
          this.form.reset();
          this.form.enable();
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.form.enable();
        },
        complete: () => {}
      });
    }
  }
}

  cancel(): void {
    this.dialogRef.close();
  }
}
