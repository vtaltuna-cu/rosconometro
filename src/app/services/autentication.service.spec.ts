/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AutenticationService } from './autentication.service';

describe('Service: Autentication', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutenticationService]
    });
  });

  it('should ...', inject([AutenticationService], (service: AutenticationService) => {
    expect(service).toBeTruthy();
  }));
});
