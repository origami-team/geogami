import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGameListPage } from './edit-game-list.page';

describe('EditGameListPage', () => {
  let component: EditGameListPage;
  let fixture: ComponentFixture<EditGameListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGameListPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGameListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
