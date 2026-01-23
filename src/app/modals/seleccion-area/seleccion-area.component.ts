import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

interface AreaNode {
  id: string;
  nombre: string;
  children?: AreaNode[];
}

interface AreaFlatNode {
  expandable: boolean;
  nombre: string;
  level: number;
  id: string;
}

@Component({
  selector: 'app-seleccion-area',
  imports: [
      MatTreeModule,
      MatTooltipModule,
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
  templateUrl: './seleccion-area.component.html',
  styleUrl: './seleccion-area.component.scss'
})
export class SeleccionAreaComponent {

  displayedColumns: string[] = ['organizacion', 'clave', 'nombre', 'responsable', 'telefono', 'activo', 'acciones'];
    dataSource2: any[] = [];
    organizaciones: any[] = [];
    organizacionControl = new FormControl('0');
  
  
    //------------------
    private transformer = (node: AreaNode , level: number): AreaFlatNode => ({
      expandable: !!node.children && node.children.length > 0,
      nombre: node.nombre,
      level,
      id: node.id
    });
  
    treeControl = new FlatTreeControl<AreaFlatNode>(
      node => node.level,
      node => node.expandable
    );
  
    treeFlattener = new MatTreeFlattener(
      this.transformer,
      node => node.level,
      node => node.expandable,
      node => node.children
    );
  
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  
    nestedData: AreaNode[] = [];
    //------------------

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<SeleccionAreaComponent>,
         @Inject(MAT_DIALOG_DATA) public data: any
      ) {
        console.log(this.data);
        this.dataSource.data = data;
    
      }
    
      hasChild = (_: number, node: AreaFlatNode) => node.expandable;

      seleccionarArea(area){
        this.dialogRef.close(area);
      }

}
