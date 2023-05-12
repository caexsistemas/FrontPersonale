/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RetributionComponent } from './retribution.component';

describe('RetributionComponent', () => {
  let component: RetributionComponent;
  let fixture: ComponentFixture<RetributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
