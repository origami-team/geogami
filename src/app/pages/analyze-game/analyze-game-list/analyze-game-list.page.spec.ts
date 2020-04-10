import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzeGameListPage } from './analyze-game-list.page';

describe('EditGameListPage', () => {
  let component: AnalyzeGameListPage;
  let fixture: ComponentFixture<AnalyzeGameListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyzeGameListPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyzeGameListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
