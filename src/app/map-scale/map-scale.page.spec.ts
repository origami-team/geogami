import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapScalePage } from './map-scale.page';

describe('MapScalePage', () => {
  let component: MapScalePage;
  let fixture: ComponentFixture<MapScalePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapScalePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapScalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
