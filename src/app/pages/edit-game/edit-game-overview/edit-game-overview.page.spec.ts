import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGameOverviewPage } from './edit-game-overview.page';

describe('EditGameOverviewPage', () => {
  let component: EditGameOverviewPage;
  let fixture: ComponentFixture<EditGameOverviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGameOverviewPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGameOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
