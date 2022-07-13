import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RqcalidadComponent } from './rqcalidad.component';

describe('RqcalidadComponent', () => {
  let component: RqcalidadComponent;
  let fixture: ComponentFixture<RqcalidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RqcalidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RqcalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
