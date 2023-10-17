export class MapFeatures {
    constructor(
        public zoombar: String,
        public pan: String,
        public rotation: String,
        public material: String,
        public position: String,
        public direction: String,
        public track: false,
        public keepTrack: String,
        public streetSection: boolean,
        public landmarks: boolean,
        public landmarkFeatures: any,
        public reducedInformation: boolean,
        public reducedMapSectionDiameter: number,
        public switchLayer: String

    ) { }
}

