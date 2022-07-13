import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RqcalidadvmrpComponent } from './rqcalidadvmrp.component';

describe('RqcalidadvmrpComponent', () => {
  let component: RqcalidadvmrpComponent;
  let fixture: ComponentFixture<RqcalidadvmrpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RqcalidadvmrpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RqcalidadvmrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
