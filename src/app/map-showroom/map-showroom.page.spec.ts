import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapShowroomPage } from './map-showroom.page';

describe('MapShowroomPage', () => {
  let component: MapShowroomPage;
  let fixture: ComponentFixture<MapShowroomPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapShowroomPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapShowroomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
