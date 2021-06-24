import { IControl, Map as MapboxMap } from 'mapbox-gl';


export class SatControl implements IControl {
    _map: MapboxMap;
    _container: HTMLDivElement;
    mapStyleContainer: HTMLDivElement;
    styleButton: HTMLButtonElement;
    onAdd(map) {
        this._map = map;

        this._map.on('load', () => {
            this._map.addSource('satellite', {
                type: 'raster',
                url: 'mapbox://mapbox.satellite',
                tileSize: 256
            });
        });

        this._container = document.createElement('div');
        this._container.classList.add('mapboxgl-ctrl');
        this._container.classList.add('mapboxgl-ctrl-group');
        this.styleButton = document.createElement('button');
        this.styleButton.type = 'button';
        this.styleButton.classList.add('mapboxgl-ctrl-icon');
        this.styleButton.classList.add('mapboxgl-sat-switcher');
        this._container.appendChild(this.styleButton);

        this.styleButton.addEventListener('click', () => this.toggleSatLayer());

        return this._container;
    }

    toggleSatLayer() {
        if (this._map.getLayer('satellite')) {
            this._map.removeLayer('satellite');
            this._container.style.background = null;
        } else {
            this._map.addLayer({
                id: 'satellite',
                source: 'satellite',
                type: 'raster'
            });
            this._container.style.background = 'lightblue';
        }
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}