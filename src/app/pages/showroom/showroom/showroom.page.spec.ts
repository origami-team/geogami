import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowroomPage } from './showroom.page';

describe('ShowroomPage', () => {
  let component: ShowroomPage;
  let fixture: ComponentFixture<ShowroomPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowroomPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowroomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
