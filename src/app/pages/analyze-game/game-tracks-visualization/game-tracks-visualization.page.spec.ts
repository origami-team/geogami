import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GameTracksVisualizationPage } from './game-tracks-visualization.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('GameTracksVisualizationPage', () => {
  let component: GameTracksVisualizationPage;
  let fixture: ComponentFixture<GameTracksVisualizationPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameTracksVisualizationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameTracksVisualizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
