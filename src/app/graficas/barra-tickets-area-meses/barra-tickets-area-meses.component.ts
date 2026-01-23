import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { DonaTicketsAreaComponent } from '../dona-tickets-area/dona-tickets-area.component';
import { TranslocoModule } from '@jsverse/transloco';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
  yaxis?: ApexYAxis;
  tooltip?: ApexTooltip;
};

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexYAxis,
  ApexTooltip
} from 'ng-apexcharts';

@Component({
  selector: 'app-barra-tickets-area-meses',
  encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DonaTicketsAreaComponent,
        TranslocoModule,
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
  templateUrl: './barra-tickets-area-meses.component.html',
  styleUrl: './barra-tickets-area-meses.component.scss'
})
export class BarraTicketsAreaMesesComponent {
  @Input() etiquetas: string[] = [];
  @Input() series: any[] = [];

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  ngOnChanges() {
    console.log('MESES',this.etiquetas);
    console.log('SERIES',this.series);
    this.chartOptions = {
      series: this.series,
      chart: {
        type: 'bar',
        height: 400,
        stacked: false,
        toolbar: {
          show: true,
        },
      },
      title: {
        text: 'Tickets abiertos vs cerrados (últimos 12 meses)',
        align: 'left',
      },
      xaxis: {
        categories: this.etiquetas,
        title: {
          text: 'Mes',
        },
      },
      yaxis: {
        title: {
          text: 'Cantidad de tickets',
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'top',
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
    };
  }

}
