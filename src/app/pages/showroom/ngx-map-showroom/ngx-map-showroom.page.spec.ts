import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NGXMapShowroomPage } from './ngx-map-showroom.page';

describe('NGXMapShowroomPage', () => {
  let component: NGXMapShowroomPage;
  let fixture: ComponentFixture<NGXMapShowroomPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NGXMapShowroomPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NGXMapShowroomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
