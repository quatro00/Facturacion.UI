import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfdiDetalleComponent } from './cfdi-detalle.component';

describe('CfdiDetalleComponent', () => {
  let component: CfdiDetalleComponent;
  let fixture: ComponentFixture<CfdiDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfdiDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CfdiDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
