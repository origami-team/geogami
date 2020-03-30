import { TestBed } from '@angular/core/testing';

import { OrigamiOrientationService } from './origami-orientation.service';

describe('OrigamiOrientationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrigamiOrientationService = TestBed.get(OrigamiOrientationService);
    expect(service).toBeTruthy();
  });
});
