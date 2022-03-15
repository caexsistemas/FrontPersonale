import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RqcalidadDialog } from './rqcalidad.dialog.component';

describe('RqcalidadComponent', () => {
  let component: RqcalidadDialog;
  let fixture: ComponentFixture<RqcalidadDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RqcalidadDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RqcalidadDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
