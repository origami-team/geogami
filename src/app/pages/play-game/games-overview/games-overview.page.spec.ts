import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesOverviewPage } from './games-overview.page';

describe('GamesOverviewPage', () => {
  let component: GamesOverviewPage;
  let fixture: ComponentFixture<GamesOverviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamesOverviewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamesOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
