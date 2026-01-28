import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReenviarCfdiDialogDataComponent } from './reenviar-cfdi-dialog-data.component';

describe('ReenviarCfdiDialogDataComponent', () => {
  let component: ReenviarCfdiDialogDataComponent;
  let fixture: ComponentFixture<ReenviarCfdiDialogDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReenviarCfdiDialogDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReenviarCfdiDialogDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
