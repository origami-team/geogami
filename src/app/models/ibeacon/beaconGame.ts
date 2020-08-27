import { Task } from './task';

export class BeaconGame {
    constructor(
        public name: string,
        public useGPS: boolean,
        public tasks: Task[]
    ) { }
}