import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapasinsopComponent } from './incapasinsop.component';

describe('IncapasinsopComponent', () => {
  let component: IncapasinsopComponent;
  let fixture: ComponentFixture<IncapasinsopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncapasinsopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncapasinsopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
