import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGameTasksPage } from './edit-game-tasks.page';

describe('EditGameTasksPage', () => {
  let component: EditGameTasksPage;
  let fixture: ComponentFixture<EditGameTasksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGameTasksPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGameTasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
