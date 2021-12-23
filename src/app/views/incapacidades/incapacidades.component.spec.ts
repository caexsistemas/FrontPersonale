import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapacidadesComponent } from './incapacidades.component';

describe('IncapacidadesComponent', () => {
  let component: IncapacidadesComponent;
  let fixture: ComponentFixture<IncapacidadesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncapacidadesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncapacidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
