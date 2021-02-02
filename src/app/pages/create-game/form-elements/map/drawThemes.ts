const warningColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning');
const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-secondary');
const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');
const tertiaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-tertiary');

export const searchArea = [
    {
        id: 'gl-draw-polygon-fill-inactive',
        type: 'fill',
        filter: ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
        ],
        paint: {
            'fill-color': secondaryColor,
            'fill-outline-color': secondaryColor,
            'fill-opacity': 0.1
        }
    },
    {
        id: 'gl-draw-polygon-fill-active',
        type: 'fill',
        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
        paint: {
            'fill-color': secondaryColor,
            'fill-outline-color': secondaryColor,
            'fill-opacity': 0.1
        }
    },
    {
        id: 'gl-draw-polygon-midpoint',
        type: 'circle',
        filter: ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'midpoint']],
        paint: {
            'circle-radius': 3,
            'circle-color': secondaryColor
        }
    },
    {
        id: 'gl-draw-polygon-stroke-inactive',
        type: 'line',
        filter: ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
        ],
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': secondaryColor,
            'line-width': 2
        }
    },
    {
        id: 'gl-draw-polygon-stroke-active',
        type: 'line',
        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': secondaryColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2
        }
    },
    {
        id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
        type: 'circle',
        filter: ['all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
        ],
        paint: {
            'circle-radius': 5,
            'circle-color': '#fff'
        }
    },
    {
        id: 'gl-draw-polygon-and-line-vertex-inactive',
        type: 'circle',
        filter: ['all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
        ],
        paint: {
            'circle-radius': 3,
            'circle-color': secondaryColor
        }
    },
    {
        id: 'gl-draw-polygon-fill-static',
        type: 'fill',
        filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
        paint: {
            'fill-color': secondaryColor,
            'fill-outline-color': secondaryColor,
            'fill-opacity': 0.1
        }
    },
    {
        id: 'gl-draw-polygon-stroke-static',
        type: 'line',
        filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': secondaryColor,
            'line-width': 2
        }
    }
];