import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCaja } from './control-caja';

describe('ControlCaja', () => {
  let component: ControlCaja;
  let fixture: ComponentFixture<ControlCaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlCaja]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlCaja);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
