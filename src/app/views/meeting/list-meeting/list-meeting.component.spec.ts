import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMeetingComponent } from './list-meeting.component';

describe('AddMeetingComponent', () => {
  let component: ListMeetingComponent;
  let fixture: ComponentFixture<ListMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
