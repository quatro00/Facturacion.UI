import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarTicketComponent } from './cerrar-ticket.component';

describe('CerrarTicketComponent', () => {
  let component: CerrarTicketComponent;
  let fixture: ComponentFixture<CerrarTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CerrarTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CerrarTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
