export class BeaconInfo {
    constructor(
      public uuid: string,
      public major: number,
      public minor: number,
      public lng: number,
      public lat: number,
      public distanceMeter: number = 3
    ) {}
  }