import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaCreditoParcialComponent } from './nota-credito-parcial.component';

describe('NotaCreditoParcialComponent', () => {
  let component: NotaCreditoParcialComponent;
  let fixture: ComponentFixture<NotaCreditoParcialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaCreditoParcialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotaCreditoParcialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
