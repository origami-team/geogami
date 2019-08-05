import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSwipePage } from './map-swipe.page';

describe('MapSwipePage', () => {
  let component: MapSwipePage;
  let fixture: ComponentFixture<MapSwipePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapSwipePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSwipePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
