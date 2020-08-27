export class TasksDetail {
    constructor(
        public taskID: Number,
        public targetDistance: Number,
        public reachedBeaconTime: String,
        public reachedBeaconDistance: Number,
        public reachedGPSTime: String,
        public reachedGPSDistance: Number,
        public GPSAccuracy: Number
    ) { }
}