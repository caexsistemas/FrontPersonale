import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessaludComponent } from './processalud.component';

describe('ProcessaludComponent', () => {
  let component: ProcessaludComponent;
  let fixture: ComponentFixture<ProcessaludComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessaludComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
