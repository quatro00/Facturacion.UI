import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteFacturarComponent } from './cliente-facturar.component';

describe('ClienteFacturarComponent', () => {
  let component: ClienteFacturarComponent;
  let fixture: ComponentFixture<ClienteFacturarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteFacturarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteFacturarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
