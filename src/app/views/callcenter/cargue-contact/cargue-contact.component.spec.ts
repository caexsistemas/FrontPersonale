import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargueContactComponent } from './cargue-contact.component';

describe('CargueContactComponent', () => {
  let component: CargueContactComponent;
  let fixture: ComponentFixture<CargueContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CargueContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargueContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
