import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFeaturesModalPage } from './map-features-modal.page';

describe('MapFeaturesModalPage', () => {
  let component: MapFeaturesModalPage;
  let fixture: ComponentFixture<MapFeaturesModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapFeaturesModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFeaturesModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
