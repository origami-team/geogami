import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskShowroomPage } from './task-showroom.page';

describe('TaskShowroomPage', () => {
  let component: TaskShowroomPage;
  let fixture: ComponentFixture<TaskShowroomPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskShowroomPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskShowroomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
