import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfdisListComponent } from './cfdis-list.component';

describe('CfdisListComponent', () => {
  let component: CfdisListComponent;
  let fixture: ComponentFixture<CfdisListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfdisListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CfdisListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
