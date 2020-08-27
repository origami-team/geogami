export class BeaconFullInfo {
  constructor(
    public uuid: string,
    public major: number,
    public minor: number,
    public proximity: string,
    public tx: number,
    public rssi: number,
    public accuracy: number,
    public visibility: boolean
  ) { }
}