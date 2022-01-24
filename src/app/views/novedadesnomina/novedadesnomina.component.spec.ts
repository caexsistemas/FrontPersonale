import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NovedadesnominaComponent } from './novedadesnomina.component';

describe('NovedadesnominaComponent', () => {
  let component: NovedadesnominaComponent;
  let fixture: ComponentFixture<NovedadesnominaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NovedadesnominaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NovedadesnominaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
