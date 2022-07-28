import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenteeismComponent } from './absenteeism.component';

describe('AbsenteeismComponent', () => {
  let component: AbsenteeismComponent;
  let fixture: ComponentFixture<AbsenteeismComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbsenteeismComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsenteeismComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
