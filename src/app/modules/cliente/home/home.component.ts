import { CurrencyPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common';
import { DonaTicketsAreaComponent } from 'app/graficas/dona-tickets-area/dona-tickets-area.component';
import { BarraTicketsAreaMesesComponent } from 'app/graficas/barra-tickets-area-meses/barra-tickets-area-meses.component';
import { Supervisor_HomeService } from 'app/services/supervisor/supervisor_home.service';
import { AlertService } from 'app/services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DonaTicketsAreaComponent,
    BarraTicketsAreaMesesComponent,
    TranslocoModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    NgApexchartsModule,
    MatTableModule,
    NgClass,
    CurrencyPipe,

    MatTooltipModule,
    DecimalPipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  public nuevos:number = 0;
  asignados:number = 0;
  enEspera:number = 0;
  porConfirmar:number = 0;
  muestraGraficaMensual = false;
  graficaMensual:any;
  /**
   * Constructor
   */
  constructor(
    private _homeService: Supervisor_HomeService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._homeService.IndicadoresMensuales()
    .subscribe({
        next: (response) => {
          this.graficaMensual = response;
          console.log(this.graficaMensual);
          this.muestraGraficaMensual = true;
          this.cdRef.detectChanges();
        },
        complete: () => {
          //this.btnLoading = false;
        },
        error: () => {
          //this.btnLoading = false;
          this.alertService.showError('Error', 'Ocurrió un error inesperado.');
        }
      })


    this._homeService.IndicadoresPrincipales()
    .subscribe({
        next: (response) => {
          console.log(response);
          this.nuevos = response.nuevos;
          this.asignados = response.asignados;
          this.enEspera = response.enEspera;
          this.porConfirmar = response.porConfirmar;

          this.cdRef.detectChanges();
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


}
