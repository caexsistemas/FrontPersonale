/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PqrCallcenterComponent } from './pqrCallcenter.component';

describe('PqrCallcenterComponent', () => {
  let component: PqrCallcenterComponent;
  let fixture: ComponentFixture<PqrCallcenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PqrCallcenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PqrCallcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
