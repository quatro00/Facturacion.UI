import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';


import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { OrganizacionFormComponent } from 'app/modals/organizacion-form/organizacion-form.component';
import { OrganizacionService } from 'app/services/admin/organizacion.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organizaciones',
  standalone: true,
  templateUrl: './organizaciones.component.html',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule],
  styles: [
    /* language=SCSS */
    `
            .inventory-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 48px 112px auto 112px 96px 96px 72px;
                }
            }
        `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class OrganizacionesComponent {

  searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  displayedColumns: string[] = ['clave', 'nombre', 'telefono', 'direccion', 'responsable', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private organizacionService:OrganizacionService
  ) { }

  nuevaOrganizacion(): void {
    const dialogRef = this.dialog.open(OrganizacionFormComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        // Aquí puedes llamar a tu servicio para guardar la nueva organización
      }
    });
  }

  ngOnInit(): void {
    this.loadData();

    // Filtro por input
    this.searchInputControl.valueChanges.subscribe(value => {
      this.dataSource.filter = value.trim().toLowerCase();
    });

    this.dataSource.filterPredicate = (data, filter) => {
      return Object.values(data).some(value =>
        (value + '').toLowerCase().includes(filter)
      );
    };
  }

  activar(item){
    this.organizacionService.Reactivar(item.id)
    .subscribe({
      next: (response) => {
        this.loadData();
      },
      complete: () => {
        //this.btnLoading = false;
      },
      error: () => {
        //this.btnLoading = false;
      }
    })
  }

  desactivar(item){
    this.organizacionService.Desactivar(item.id)
    .subscribe({
      next: (response) => {
        this.loadData();
      },
      complete: () => {
        //this.btnLoading = false;
      },
      error: () => {
        //this.btnLoading = false;
      }
    })
  }

  editar(item){
    const dialogRef = this.dialog.open(OrganizacionFormComponent, {
    width: '500px',
    data: item, // Le pasas los datos para editar
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // refresca lista o muestra notificación
      this.loadData();
    }
  });
  }
  loadData(): void {
    //this.isLoading = true;

    // Simulación de carga (reemplazar con servicio real)
    console.log(1);
    this.organizacionService.GetAll()
    .subscribe({
          next: (response) => {
            console.log(response);
            this.dataSource.data = response;
          },
          error:(err)=>{
            //this.msg.error(err.error.message);
            //this.loadData();
          },
          complete() {
            this.isLoading = false;
          },
        });

        /*
    setTimeout(() => {
      this.dataSource.data = [
        { clave: 'ORG01', nombre: 'Hospital Central', telefono: '8123456789', direccion: 'Av. Salud 123', responsable: 'Dr. Pérez', activo: true },
        { clave: 'ORG02', nombre: 'Clínica Norte', telefono: '8187654321', direccion: 'Calle 45 Norte', responsable: 'Lic. Martínez', activo: false },
        // ... más datos
      ];

      this.dataSource.sort = this.sort;
      this.isLoading = false;
    }, 800);
    */
  }
}
