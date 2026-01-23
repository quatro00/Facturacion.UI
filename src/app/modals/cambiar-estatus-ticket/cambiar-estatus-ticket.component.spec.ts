import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarEstatusTicketComponent } from './cambiar-estatus-ticket.component';

describe('CambiarEstatusTicketComponent', () => {
  let component: CambiarEstatusTicketComponent;
  let fixture: ComponentFixture<CambiarEstatusTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarEstatusTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarEstatusTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
