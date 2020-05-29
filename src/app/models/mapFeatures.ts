export class MapFeatures {
    constructor(
        public zoombar: String,
        public pan: String,
        public rotation: String,
        public material: String,
        public position: String,
        public direction: String,
        public track: boolean,
        public streetSection: boolean,
        public landmarks: boolean,
        public landmarkFeatures: any,
        public reducedInformation: boolean,
        public slectedMapSection: any[]
    ) { }
}

