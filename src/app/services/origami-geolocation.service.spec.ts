import { TestBed } from '@angular/core/testing';

import { OrigamiGeolocationService } from './origami-geolocation.service';

describe('OrigamiGeolocationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrigamiGeolocationService = TestBed.get(OrigamiGeolocationService);
    expect(service).toBeTruthy();
  });
});
