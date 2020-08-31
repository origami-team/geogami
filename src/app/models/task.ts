import { MapFeatures } from './mapFeatures';
import { BeaconInfo } from './ibeacon/beaconInfo';

export class Task {
  constructor(
    public answer: any,
    public category: string,
    public evaluate: string,
    public id: number,
    public mapFeatures: MapFeatures,
    public name: string,
    public question: any,
    public settings: any,
    public type: string,
    public iBeacon: boolean,
    public beaconInfo: BeaconInfo
  ) { }
}
