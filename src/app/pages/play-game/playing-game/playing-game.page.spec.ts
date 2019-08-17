import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingGamePage } from './playing-game.page';

describe('PlayingGamePage', () => {
  let component: PlayingGamePage;
  let fixture: ComponentFixture<PlayingGamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayingGamePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayingGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
