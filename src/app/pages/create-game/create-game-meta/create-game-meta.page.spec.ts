import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGameMetaPage } from './create-game-meta.page';

describe('CreateGameMetaPage', () => {
  let component: CreateGameMetaPage;
  let fixture: ComponentFixture<CreateGameMetaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameMetaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGameMetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
