import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnicalldataComponent } from './unicalldata.component';

describe('UnicalldataComponent', () => {
  let component: UnicalldataComponent;
  let fixture: ComponentFixture<UnicalldataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnicalldataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnicalldataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
