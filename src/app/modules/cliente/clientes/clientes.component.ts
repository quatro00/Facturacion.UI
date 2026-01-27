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
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cliente_Clientes } from 'app/services/cliente/cliente_clientes.service';
import { ConfirmDialogComponent } from 'app/modals/confirm-dialog/confirm-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.component.html',
  imports: [
    CommonModule,
    MatChipsModule,
    MatTableModule,
    MatCommonModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule
  ],
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
export class ClientesComponent {
searchInputControl: UntypedFormControl = new UntypedFormControl();
  isLoading: boolean = false;

  displayedColumns: string[] = ['rfc', 'razonSocial', 'usoCfdi', 'moneda', 'estado','acciones'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private router: Router,
    private cliente_clientesService:Cliente_Clientes
  ) { }

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

  editar(item){
    /*
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
  */
  }
  nuevoCliente(): void {
    this.router.navigate(['/cliente/clientes/nuevo']);
  }

  verCliente(id): void {
    this.router.navigate(['/cliente', 'clientes', 'cliente', id]);
  }

  facturar(id): void {
  this.router.navigate(['/cliente', 'clientes', 'cliente', id, 'facturar']);
  }

  loadData(): void {
    
    this.cliente_clientesService.Get()
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

  }

  toggleActivo(org: any): void {
    const activar = !org.activo;

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
        width: '380px',
        data: {
            title: activar ? 'Activar cliente' : 'Desactivar cliente',
            message: activar
                ? `¿Deseas activar al cliente "${org.razonSocial}"?`
                : `¿Deseas desactivar al cliente "${org.razonSocial}"?`,
            confirmText: activar ? 'Activar' : 'Desactivar',
            cancelText: 'Cancelar',
            color: activar ? 'primary' : 'warn'
        }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
        if (!confirmado) return;
        
        this.cliente_clientesService.updateActivo(org.clienteId, activar).subscribe({
            next: (res) => {
                org.activo = res.activo; // actualiza UI
            },
            error: (err) => {
                // aquí puedes mostrar snack/toast
                console.error(err);
            }
        });
    });
}
}

