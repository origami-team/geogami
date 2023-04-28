import { Map as MapboxMap } from 'mapbox-gl';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum TrackType {
    Enabled,
    Disabled
}

export class TrackControl {
    private map: MapboxMap;
    private path: any;
    private trackType: TrackType;
    private positionSubscription: Subscription;

    // VR world
    isVirtualWorld: boolean = false;
    private avatarPositionSubscription: Subscription;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService, isVirtualWorld: boolean) {
        this.map = map;
        this.isVirtualWorld = isVirtualWorld; // VR world (to check game type)
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
        const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

        this.path = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
        if (!isVirtualWorld) {
            this.positionSubscription = this.geolocationService.geolocationSubscription
                .pipe(filter(p => p.coords.accuracy <= 5))
                .subscribe(position => {
                    this.path.geometry.coordinates.push([
                        position.coords.longitude,
                        position.coords.latitude
                    ]);
                    if (this.map && this.map.getSource('track')) {
                        this.map.getSource('track').setData(this.path);
                    }
                });
        } else {
            // VR world
            this.avatarPositionSubscription = this.geolocationService.avatarGeolocationSubscription.subscribe(
                avatarPosition => {
                    this.path.geometry.coordinates.push([
                        parseFloat(avatarPosition["x"]) / 111000,
                        parseFloat(avatarPosition["z"]) / 111200
                    ]);
                    if (this.map && this.map.getSource('track')) {
                        this.map.getSource('track').setData(this.path);
                    }
                });
        }

        this.map.addSource('track', { type: 'geojson', data: this.path });
        this.map.addLayer({
            id: 'track',
            type: 'line',
            source: 'track',
            paint: {
                'line-color': dangerColor,
                'line-opacity': 0.5,
                'line-width': 5
            },
            layout: {
                'line-cap': 'round'
            }
        });
        this.map.setLayoutProperty('track', 'visibility', 'none');
    }

    public setType(type: TrackType): void {
        if (this.map != undefined) {
            this.trackType = type;
            this.reset();
            this.update();
        }
    }

    private reset(): void {
        this.path = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
    }

    private update(): void {
        switch (this.trackType) {
            case TrackType.Enabled:
                this.map.setLayoutProperty('track', 'visibility', 'visible');
                break;
            case TrackType.Disabled:
                this.map.setLayoutProperty('track', 'visibility', 'none');
                break;

        }
    }

    // keep track permanent impl.
    addPermanentTrack(taskId, path = this.path){
        // console.log("(track) P index:", taskId,"path: ",path)

        //* to avoid error caused when swaping between tasks
        if(this.map.getLayer(`permanentTrack${taskId}`)){
            this.map.addSource(`permanentTrack${taskId}`, { type: 'geojson', data: path });
            this.map.addLayer({
                id: `permanentTrack${taskId}`,
                type: 'line',
                source: `permanentTrack${taskId}`,
                paint: {
                    'line-color': "#fbff00", // warning color (yellow)
                    'line-opacity': 0.5,
                    'line-width': 5
                },
                layout: {
                    'line-cap': 'round'
                }
            });
        }
    }
    
    // keep track temporary impl.
    addTemporaryTrack(taskId, path = this.path){
        // // console.log("(track) T index:", taskId,"path: ",path)
        this.map.addSource(`temporaryTrack${taskId}`, { type: 'geojson', data: path });
        this.map.addLayer({
            id: `temporaryTrack${taskId}`,
            type: 'line',
            source: `temporaryTrack${taskId}`,
            paint: {
                'line-color': "#fbff00", // warning color (yellow)
                'line-opacity': 0.5,
                'line-width': 5
            },
            layout: {
                'line-cap': 'round'
            }
        });
    }

    // remove track temporary impl.
    removeTemporaryTrack(taskId){
        if (this.map.getLayer(`temporaryTrack${taskId}`)) {
            // // console.log('removeTemporaryTrack/////(track): ', taskId)
            this.map.removeLayer(`temporaryTrack${taskId}`);
        }
    }

    public remove(): void {
        if (this.map.getLayer('track')) {
            this.map.removeLayer('track');
        }
        this.path = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };

        if (!this.isVirtualWorld) {
            this.positionSubscription.unsubscribe();
        } else {
            this.avatarPositionSubscription.unsubscribe();
        }
        // window.navigator.geolocation.clearWatch(this.trackPositionWatch);
    }
}