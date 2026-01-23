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
  selector: 'app-cambiar-estatus-ticket',
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
  templateUrl: './cambiar-estatus-ticket.component.html',
  styleUrl: './cambiar-estatus-ticket.component.scss'
})
export class CambiarEstatusTicketComponent implements OnInit {
form: FormGroup;
ticketId:any='';
estatusTicket:any[]=[];
  constructor(
    public dialogRef: MatDialogRef<CambiarEstatusTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      mensaje: ['', [Validators.required]],
      estatusTicketId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('datos recibidos',this.data);
    this.ticketId = this.data.ticketId;
    this.estatusTicket = this.data.estatusTickets;
  }
  enviar(): void {
    if (this.form.invalid) return;
    
    let response = {
      ticketId: this.ticketId,
      mensaje: this.form.value.mensaje,
      estatusTicketId : this.form.value.estatusTicketId
    };

    
    this.dialogRef.close(response); // O puedes pasar `formData`
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
