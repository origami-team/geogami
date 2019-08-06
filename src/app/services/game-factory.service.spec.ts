import { TestBed } from '@angular/core/testing';

import { GameFactoryService } from './game-factory.service';

describe('GameFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameFactoryService = TestBed.get(GameFactoryService);
    expect(service).toBeTruthy();
  });
});
