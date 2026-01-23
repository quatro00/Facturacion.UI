import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolverTicketComponent } from './resolver-ticket.component';

describe('ResolverTicketComponent', () => {
  let component: ResolverTicketComponent;
  let fixture: ComponentFixture<ResolverTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolverTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolverTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
