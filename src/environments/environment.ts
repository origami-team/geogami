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
      name: "Zoom Pre - Initial",
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
        [0.0002323873874 - 0.001, 0.0003759622302 - 0.0015],
        [0.001583738739 + 0.001, 0.0017125625 + 0.001]
      ],
      zoom: 19,
      zoomInLayer1: "VirEnv_3_zoom1"
    },
    "VirEnv_4": {
      name: "Zoom - Pre Easy",
      initialPosition: {
        lng: 101.13 / 111000,
        lat: 68.69 / 112000
      },
      overlayCoords: [
        [0.0002413063063, 0.001713741071],
        [0.001592657658, 0.001713741071],
        [0.001592657658, 0.0001972931655],
        [0.0002413063063, 0.0001972931655]
      ],
      center: [0.001351351351 / 2, 0.001517857143 / 2],
      bounds: [
        [0.0002413063063 - 0.001, 0.0001972931655 - 0.0015],
        [0.001592657658 + 0.001, 0.001713741071 + 0.001]
      ],
      zoom: 19,
      zoomInLayer1: "VirEnv_4_zoom1"
    },
    "VirEnv_5": {
      name: "Zoom - Pre Difficult",
      initialPosition: {
        lng: 101.13 / 111000,
        lat: 68.69 / 112000
      },
      overlayCoords: [
        [0.0002413063063, 0.001713741071],
        [0.001592657658, 0.001713741071],
        [0.001592657658, 0.0001972931655],
        [0.0002413063063, 0.0001972931655]
      ],
      center: [0.001351351351 / 2, 0.001517857143 / 2],
      bounds: [
        [0.0002413063063 - 0.001, 0.0001972931655 - 0.0015],
        [0.001592657658 + 0.001, 0.001713741071 + 0.001]
      ],
      zoom: 19,
      zoomInLayer1: "VirEnv_5_zoom1"
    },
    "VirEnv_6": {
      name: "Location Marker - Post Test Difficult",
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
        [0.0002323873874 - 0.001, 0.0003759622302 - 0.0015],
        [0.001583738739 + 0.001, 0.0017125625 + 0.001]
      ],
      zoom: 19
    }

  },
  virEnvsLayers: [
    {
      EnvName: "VirEnv_1",
      layerName: "VirEnv_1",
      img_url: "assets/vir_envs_layers/VirEnv_1.png"
    },
    {
      EnvName: "VirEnv_2",
      layerName: "VirEnv_2",
      img_url: "assets/vir_envs_layers/VirEnv_2.png"
    },{
      EnvName: "Zoom Pre - Initial",
      layerName: "VirEnv_3",
      img_url: "assets/vir_envs_layers/VirEnv_3.png"
    },{
      EnvName: "Zoom Pre Easy",
      layerName: "VirEnv_4",
      img_url: "assets/vir_envs_layers/VirEnv_4_zoom1.png"
    },{
      EnvName: "Zoom Pre Difficult",
      layerName: "VirEnv_5",
      img_url: "assets/vir_envs_layers/VirEnv_5_zoom1.png"
    },{
      EnvName: "Location Marker - Post Test Difficult",
      layerName: "VirEnv_6",
      img_url: "assets/vir_envs_layers/VirEnv_6.png"
    }

  ],
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
