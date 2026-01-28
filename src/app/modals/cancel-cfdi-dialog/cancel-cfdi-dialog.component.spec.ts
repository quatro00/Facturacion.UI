import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelCfdiDialogComponent } from './cancel-cfdi-dialog.component';

describe('CancelCfdiDialogComponent', () => {
  let component: CancelCfdiDialogComponent;
  let fixture: ComponentFixture<CancelCfdiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelCfdiDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelCfdiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
