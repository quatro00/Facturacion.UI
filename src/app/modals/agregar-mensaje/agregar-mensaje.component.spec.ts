import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarMensajeComponent } from './agregar-mensaje.component';

describe('AgregarMensajeComponent', () => {
  let component: AgregarMensajeComponent;
  let fixture: ComponentFixture<AgregarMensajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarMensajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarMensajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
