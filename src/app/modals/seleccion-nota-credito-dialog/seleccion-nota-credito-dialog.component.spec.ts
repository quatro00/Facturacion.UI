import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionNotaCreditoDialogComponent } from './seleccion-nota-credito-dialog.component';

describe('SeleccionNotaCreditoDialogComponent', () => {
  let component: SeleccionNotaCreditoDialogComponent;
  let fixture: ComponentFixture<SeleccionNotaCreditoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionNotaCreditoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionNotaCreditoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
