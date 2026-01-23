import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { AreaFormComponent } from 'app/modals/area-form/area-form.component';
import { UsuarioFormComponent } from 'app/modals/usuario-form/usuario-form.component';
import { AreaService } from 'app/services/admin/area.service';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { UsuarioService } from 'app/services/admin/usuario.service';
import { forkJoin } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-usuarios',
   imports: [
    CommonModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  displayedColumns: string[] = ['avatar', 'username', 'nombre','apellidos','correoElectronico', 'telefono', 'organizacion', 'rol', 'activo','acciones'];
  dataSource =  new MatTableDataSource<any>();
  organizaciones: any[] = [];
  usuarios: any[] = [];
  organizacionControl = new FormControl('0');


  constructor(
    private dialog: MatDialog,
    private areaService: AreaService,
    private organizacionService: OrganizacionService,
    private usuarioService: UsuarioService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadData();
    
    // Filtro por input
    this.searchInputControl.valueChanges.subscribe(value => {
      console.log(1);
      this.dataSource.filter = value.trim().toLowerCase();
    });

    this.dataSource.filterPredicate = (data, filter) => {
      return Object.values(data).some(value =>
        (value + '').toLowerCase().includes(filter)
      );
    };
  }

  filtrarUsuariosPorRol(rolSeleccionado: string) {
  if (rolSeleccionado === '0') {
    this.dataSource.data = this.usuarios;
  } else {
    this.dataSource.data = this.usuarios.filter(u =>
      u.roles.includes(rolSeleccionado)
    );
    console.log(this.dataSource);
  }
}

  loadData(){
    forkJoin([this.usuarioService.GetAll()]).subscribe({
      next: ([usuariosResponse]) => {
        console.log(usuariosResponse);
        this.usuarios = usuariosResponse;
        this.dataSource.data = usuariosResponse;
        console.log(usuariosResponse);
      },
      complete: () => { },
      error: () => {
         this.alertService.showError('Error', 'Ocurrió un error inesperado.');
      }
    });
  }
  loadOrganizaciones() {

    this.organizacionService.GetAll().subscribe((data) => {
      this.organizaciones = data;
    });

  }

  onOrganizacionChange(idOrganizacion: string | null) {
    console.log('Organización seleccionada:', idOrganizacion);
    this.cargarTabla(idOrganizacion);
  }

  cargarTabla(idOrganizacion: string | null): void {
    // Aquí llamas a tu servicio para obtener las áreas filtradas
    /*
    this.areaService.getAreas(idOrganizacion).subscribe((data) => {
      this.dataSource.data = data;
    });
    */
  }

  activar(item){
    this.usuarioService.Reactivar(item.id)
    .subscribe({
      next: (response) => {
        this.loadData();
      },
      complete: () => {
        //this.btnLoading = false;
      },
      error: () => {
        //this.btnLoading = false;
        this.alertService.showError('Error', 'Ocurrió un error inesperado.');
      }
    })
  }

  desactivar(item){
    this.usuarioService.Desactivar(item.id)
    .subscribe({
      next: (response) => {
        this.loadData();
      },
      complete: () => {
        //this.btnLoading = false;
      },
      error: () => {
        //this.btnLoading = false;
        this.alertService.showError('Error', 'Ocurrió un error inesperado.');
      }
    })
  }

  nueva(): void {
      const dialogRef = this.dialog.open(UsuarioFormComponent, {
        width: '500px',
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadData();
          // Aquí puedes llamar a tu servicio para guardar la nueva organización
        }
      });
    }

  
}
