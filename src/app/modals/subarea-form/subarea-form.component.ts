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
  selector: 'app-subarea',
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
  templateUrl: './subarea-form.component.html',
  styleUrl: './subarea-form.component.scss'
})
export class SubareaFormComponent {
 form: FormGroup;
  isEditMode: boolean;
  areaPadreId;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubareaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data.id;

    if(this.isEditMode == false){
      this.areaPadreId = data;
    }
    


    this.form = this.fb.group({
      id: [data.id],
      clave: [data.clave || '', Validators.required],
      nombre: [data.nombre || '', Validators.required],
      telefono: [data.telefono || ''],
    });
  }

  save(): void {
    var model = this.form.value;
    model.areaPadreId = this.areaPadreId;

    
    if (this.form.valid) {
      this.dialogRef.close(model);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}