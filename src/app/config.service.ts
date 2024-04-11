import { Injectable } from '@angular/core';

@Injectable()

export class ConfigService {
    constructor() { }

    Init() {
      return new Promise<void>((resolve, reject) => {
        // do your initialisation stuff here
        setTimeout(() => {
          resolve();
        }, 500);
      });
    }
}
