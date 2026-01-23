import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-equipo-de-trabajo-form',
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
  templateUrl: './equipo-de-trabajo-form.component.html',
  styleUrl: './equipo-de-trabajo-form.component.scss'
})
export class EquipoDeTrabajoFormComponent {
form: FormGroup;
  isEditMode: boolean;
  areaPadreId;
  supervisores:any[]=[];
  organizaciones:any[]=[];
  supervisoresFiltrados:any[]=[];
  organizacionSeleccionadaId;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EquipoDeTrabajoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.organizaciones = data.organizaciones;
    this.supervisores = data.supervisores;

    this.isEditMode = !!data.id;

    if(this.isEditMode == false){
      this.areaPadreId = data;
    }
    
    if(this.isEditMode == true){
      this.onSeleccionarOrganizacion(data.organizacionId);
    }


    this.form = this.fb.group({
      id: [data.id],
      organizacionId: [data.organizacionId || '', Validators.required],
      nombre: [data.nombre || '', Validators.required],
      supervisorId: [data.supervisorId || ''],
    });
  }

  onSeleccionarOrganizacion(id: any) {
    this.organizacionSeleccionadaId = id;
    console.log(this.supervisores);
    this.supervisoresFiltrados = this.supervisores.filter(
      s => s.organizacionId === id
    );
  }

  save(): void {
    var model = this.form.value;

    if (this.form.valid) {
      this.dialogRef.close(model);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
