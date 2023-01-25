import { TestBed } from '@angular/core/testing';

import { GetWeatherDetailsService } from './get-weather-details.service';

describe('GetWeatherDetailsService', () => {
  let service: GetWeatherDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetWeatherDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
