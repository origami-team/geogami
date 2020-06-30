import { Task } from './task';

export class Game {
  constructor(
    public _id: number,
    public name: string,
    public tracking: boolean,
    public tasks: Task[],
    public bbox: any = undefined,
    public mapSectionVisible: boolean
  ) { }
}
