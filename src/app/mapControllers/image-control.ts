import { Component } from '@angular/core';

@Component({
    selector: 'app-map-image-control',
    template: `
        <mgl-image
            id="view-direction-task"
            url="/assets/icons/directionv2-richtung.png"
        >
        <mgl-image
            id="marker-editor"
            url="/assets/icons/marker-editor.png"
        >
        <mgl-image
            id="view-direction-click-geolocate"
            url="/assets/icons/position.png"
        >
        <mgl-image
            id="landmark-marker"
            url="/assets/icons/landmark-marker.png"
        >
        <mgl-image
            id="view-direction"
            url="/assets/icons/directionv2.png"
        >
        <mgl-image
            id="geolocate"
            url="/assets/icons/position.png"
        >
    `,
})
export class MapImageControlComponent {

    constructor() {
    }

    loadedImg() {
        console.log('loadedImg');
    }
}
