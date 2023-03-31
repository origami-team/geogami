// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiURL: "https://api.origami.felixerdmann.com",
  apiURL: "http://localhost:3001",
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
      bounds: [
        [0.0002307207207 - 0.002, 0.0003628597122 - 0.0035],      // Southwest coordinates (lng,lat)
        [0.003717027207 + 0.002, 0.004459082914 + 0.002]      // Northeast coordinates (lng,lat)
      ],
      zoom: 18
    },
    "VirEnv_2":
    {
      initialPosition: {
        lng: 214 / 111000,
        lat: 69 / 112000
      },
      bounds: [
        [0.0002307207207 - 0.002, 0.0003628597122 - 0.0035],      // Southwest coordinates (lng,lat)
        [0.003717027207 + 0.002, 0.004459082914 + 0.002]      // Northeast coordinates (lng,lat)
      ],
      zoom: 18
    },
    "VirEnv_3": {
      initialPosition: {
        lng: 157 / 111000,
        lat: 117.5 / 112000
      },
      bounds: [
        [0.0002323873874- 0.001, 0.0003759622302 - 0.001],
        [0.001583873874+ 0.001, 0.001712625+ 0.001]
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
