/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Refute.dialogComponent } from './refute.dialog.component';

describe('Refute.dialogComponent', () => {
  let component: Refute.dialogComponent;
  let fixture: ComponentFixture<Refute.dialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Refute.dialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Refute.dialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
