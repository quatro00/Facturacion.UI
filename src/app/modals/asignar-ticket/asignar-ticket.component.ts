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
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-asignar-ticket',
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
  templateUrl: './asignar-ticket.component.html',
  styleUrl: './asignar-ticket.component.scss'
})
export class AsignarTicketComponent implements OnInit {
form: FormGroup;
ticketId:any='';
agentes:any[]=[];
  constructor(
    public dialogRef: MatDialogRef<AsignarTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      agenteId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('datos recibidos',this.data);
    this.ticketId = this.data.ticketId;
    this.agentes = this.data.agentes;
  }
  enviar(): void {
    if (this.form.invalid) return;
    let response = { ticketId: this.ticketId, asignadoId: this.form.value.agenteId}
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
