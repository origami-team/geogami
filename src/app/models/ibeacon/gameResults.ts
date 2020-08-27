import { TasksDetail } from './tasksDetail';

export class GameResults {
    constructor(
        public gameName: String,
        public startTime: String,
        public endTime: String,
        public tasksDetail: TasksDetail[]
    ) { }
}