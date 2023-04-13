// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL: "https://api.origami.felixerdmann.com",
  // apiURL: "http://localhost:3001",
  mapboxAccessToken:
    "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA",
  photoQuality: 10,
  // VR world
  initialAvatarLoc: {
    lng: 224 / 111000,
    lat: 74 / 112000
  },
  initialAvatarLoc_MirroredVersion: {
    lng: 214 / 111000,
    lat: 69 / 112000
  },
  virEnvProperties: {
    "VirEnv_1": {
      initialPosition: {
        lng: 224 / 111000,
        lat: 74 / 112000
      },
      overlayCoords: [
        [0.0002307207207, 0.004459082914],
        [0.003717027207, 0.004459082914],
        [0.003717027207, 0.0003628597122],
        [0.0002307207207, 0.0003628597122]
      ],
      bounds: [
        [0.0002307207207 - 0.002, 0.0003628597122 - 0.0035],      // Southwest coordinates (lng,lat)
        [0.003717027207 + 0.002, 0.004459082914 + 0.002]      // Northeast coordinates (lng,lat)
      ],
      center: [0.00001785714286 / 2, 0.002936936937 / 2],
      zoom: 18
    },
    "VirEnv_2":
    {
      initialPosition: {
        lng: 214 / 111000,
        lat: 69 / 112000
      },
      overlayCoords: [
        [0.0002307207207, 0.004459082914],
        [0.003717027207, 0.004459082914],
        [0.003717027207, 0.0003628597122],
        [0.0002307207207, 0.0003628597122]
      ],
      center: [0.00001785714286 / 2, 0.002936936937 / 2],
      bounds: [
        [0.0002307207207 - 0.002, 0.0003628597122 - 0.0035],      // Southwest coordinates (lng,lat)
        [0.003717027207 + 0.002, 0.004459082914 + 0.002]      // Northeast coordinates (lng,lat)
      ],
      zoom: 18
    },
    "VirEnv_3": {
      initialPosition: {
        lng: 100.9 / 111000,
        lat: 60.76 / 112000
      },
      overlayCoords: [
        [0.0002323873874, 0.0017125625],
        [0.001583738739, 0.0017125625],
        [0.001583738739, 0.0003759622302],
        [0.0002323873874, 0.0003759622302]
      ],
      center: [0.001351351351 / 2, 0.001351351351 / 2],
      bounds: [
        [0.0002323873874 - 0.0007 , 0.0003759622302 - 0.0013],
        [0.0002323873874 + 0.002 , 0.0017125625 + 0.001]
      ],
      zoom: 19,
      zoomInLayer: "VirEnv_3_zoom2"
    }

  },
  mapStyle: '../../../../assets/mapStyles/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
