export class Game {

    constructor(
        public id: number,
        public name: string,
        public author: String,
        public description: string,
        public tracking: boolean,
        public tasks: any[],
        public duration?: Number,
    ) { }

}
