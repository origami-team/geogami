import { TestBed } from '@angular/core/testing';

import { TrackerService } from './tracker.service';

describe('TrackerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TrackerService = TestBed.get(TrackerService);
    expect(service).toBeTruthy();
  });
});
