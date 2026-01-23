import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { UsuarioService } from 'app/services/admin/usuario.service';

@Component({
  selector: 'app-usuario-form',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {

  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  form: FormGroup;
  roles = ['Administrador', 'Supervisor', 'Responsable de area', 'Agente'];
  organizaciones = [];

  constructor(
    private snackBar: FuseConfirmationService,
    private usuarioService: UsuarioService,
    private organizacionService: OrganizacionService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      avatar: [''],
      rol: ['', Validators.required],
      organizacionId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.organizacionService.GetAll().subscribe({
      next: (response) => {
        console.log(response);
        this.organizaciones = response;
      },
      error: (err) => {
        console.error(err);
        this.form.enable();
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.avatarFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(this.avatarFile);
    }
  }

  guardar(): void {
    if (this.form.valid) {
      const nuevoUsuario = this.form.value;
      // Validar confirmación de contraseña
      if (nuevoUsuario.password !== nuevoUsuario.confirmPassword) {
        this.snackBar.open({
            title: 'Fix360',
            message: 'Las contraseñas no coinciden.',
            icon: {
              show: true,
              name: 'error',
              color: 'warn'
            },
            actions: {
              confirm: {
                show: false
              },
              cancel: {
                show: false
              }
            },
            dismissible: true,
          });
        return;
      }

      const formData = new FormData();

      // Agrega campos de texto
      formData.append('usuario', this.form.get('usuario')?.value);
      formData.append('nombre', this.form.get('nombre')?.value);
      formData.append('apellidos', this.form.get('apellidos')?.value);
      formData.append('correo', this.form.get('correo')?.value);
      formData.append('password', this.form.get('password')?.value);
      formData.append('organizacionId', this.form.get('organizacionId')?.value);
      formData.append('rol', this.form.get('rol')?.value);

      // Agrega el archivo si fue seleccionado
      if (this.avatarFile) {
        formData.append('avatar', this.avatarFile, this.avatarFile.name);
      }

      this.form.disable();
      this.usuarioService.Crear(formData).subscribe({
        next: () => {
          this.form.reset();
          this.form.enable();
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open({
            title: 'Fix360',
            message: 'Ha ocurrido un error al procesar la solicitud.',
            icon: {
              show: true,
              name: 'error',
              color: 'warn'
            },
            actions: {
              confirm: {
                show: false
              },
              cancel: {
                show: false
              }
            },
            dismissible: true,
          });
          this.form.enable();
        },
        complete: () => { }
      });

      //console.log('Usuario guardado:', nuevoUsuario);
      //this.dialogRef.close(nuevoUsuario);
    }
  }
}