import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalDetailComponent } from './sucursal-detail.component';

describe('SucursalDetailComponent', () => {
  let component: SucursalDetailComponent;
  let fixture: ComponentFixture<SucursalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucursalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
