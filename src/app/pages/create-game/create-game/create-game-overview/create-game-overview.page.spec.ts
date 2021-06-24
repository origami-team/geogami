import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGameOverviewPage } from './create-game-overview.page';

describe('CreateGameOverviewPage', () => {
  let component: CreateGameOverviewPage;
  let fixture: ComponentFixture<CreateGameOverviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGameOverviewPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGameOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
