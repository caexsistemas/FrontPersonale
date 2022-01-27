import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NovedadesaludComponent } from './novedadesalud.component';

describe('NovedadesaludComponent', () => {
  let component: NovedadesaludComponent;
  let fixture: ComponentFixture<NovedadesaludComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NovedadesaludComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NovedadesaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
