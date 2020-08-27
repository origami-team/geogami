export class BeaconInfo {
    constructor(
      //public _uuid: number,
      public major: number,
      public minor: number,
      public lng: number,
      public lat: number,
      public distanceMeter: number = 3
    ) {}
  }