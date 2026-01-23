import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { AlertService } from 'app/services/alert.service';
import { CatCategoriaService } from 'app/services/admin/catcategoria.service';
import { CatPrioridadService } from 'app/services/admin/catprioridad.service';
import { forkJoin } from 'rxjs';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { SeleccionAreaComponent } from 'app/modals/seleccion-area/seleccion-area.component';
import { TicketService } from 'app/services/admin/ticket.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-agregar-mensaje',
  imports: [
    MatDialogModule,
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
    MatDatepickerModule,
    MatRadioModule,
    MatIcon,
    MatTooltipModule,
    MatButton,
    MatInputModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './agregar-mensaje.component.html',
  styleUrl: './agregar-mensaje.component.scss'
})
export class AgregarMensajeComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AgregarMensajeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      mensaje: ['', [Validators.required]],
      archivos: [null, null]
    });
  }

  enviar(): void {
    console.log(this.form.value.archivos);
    if (this.form.invalid) return;
    console.log(this.data);
    const formData = new FormData();
    formData.append('mensaje', this.form.value.mensaje);
    if (this.form.value.archivos != null) {
      this.form.value.archivos.forEach((archivo, index) => {
        formData.append('Archivos', archivo); // Usa el mismo nombre si es un arreglo en backend
      });
    }



    formData.append('ticketId', this.data.toString());

    // Aquí puedes hacer el envío al backend
    // this.ticketService.agregarMensaje(formData).subscribe(...)

    this.dialogRef.close(formData); // O puedes pasar `formData`
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      const fileList: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileList.push(files[i]);
      }
      this.form.patchValue({
        archivos: fileList
      });


    }
  }
}
