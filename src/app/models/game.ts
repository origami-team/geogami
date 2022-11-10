import { Task } from './task';

export class Game {
  constructor(
    public _id: number,
    public name: string,
    public place: string,
    public tracking: boolean,
    public tasks: Task[],
    public bbox: any,
    isMultiplayerGame: boolean,
    numPlayers: number,
    public mapSectionVisible: boolean,
    public geofence: boolean,
    public isVRWorld: boolean,
    public isVRMirrored: boolean,
    public isVisible: boolean,
    public isCuratedGame: boolean
  ) { }
}
