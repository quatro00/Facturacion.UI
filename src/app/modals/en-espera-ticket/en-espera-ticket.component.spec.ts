import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnEsperaTicketComponent } from './en-espera-ticket.component';

describe('EnEsperaTicketComponent', () => {
  let component: EnEsperaTicketComponent;
  let fixture: ComponentFixture<EnEsperaTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnEsperaTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnEsperaTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
