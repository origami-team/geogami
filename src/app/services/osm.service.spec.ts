import { TestBed } from '@angular/core/testing';

import { OsmService } from './osm.service';

describe('OsmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OsmService = TestBed.get(OsmService);
    expect(service).toBeTruthy();
  });
});
