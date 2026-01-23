import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTicketsComponent } from './reporte-tickets.component';

describe('ReporteTicketsComponent', () => {
  let component: ReporteTicketsComponent;
  let fixture: ComponentFixture<ReporteTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
