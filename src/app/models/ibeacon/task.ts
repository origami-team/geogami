export class Task {
    constructor(
        public _id: number,
        public minor: number,
        public coords: [number, number],
        public distanceMeter: number = 3
    ) { }
}