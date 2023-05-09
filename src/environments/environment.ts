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
      name: "Location Marker - Post Difficult",
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
    },
    "VirEnv_7": {
      name: "Location Marker - Post Easy",
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
    },
    "VirEnv_8": {
      name: "Location Marker - Pre Test Difficult",
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
    },
    "VirEnv_9": {
      name: "Location Marker - Pre Test Easy",
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
    },
    "VirEnv_10": {
      name: "Location Marker - Training 1",
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
    },
    "VirEnv_11": {
      name: "Location Marker - Training",
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
    },
    "VirEnv_12": {
      name: "Map Rotation - Post Difficult",
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
    },
    "VirEnv_13": {
      name: "Map Rotation - Post Easy 1",
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
    },
    "VirEnv_14": {
      name: "Map Rotation - - Post Easy 2",
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
    },
    "VirEnv_15": {
      name: "Map Rotation - Pre Difficult",
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
    },
    "VirEnv_16": {
      name: "Map Rotation - Pre Easy 1",
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
    },
    "VirEnv_17": {
      name: "Map Rotation - Pre Easy 2",
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
    },
    "VirEnv_18": {
      name: "Map Rotation - Training 1",
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
    },
    "VirEnv_19": {
      name: "Map Rotation - Training 2",
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
    },
    "VirEnv_20": {
      name: "Map Rotation - Training 3",
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
    },
    "VirEnv_21": {
      name: "Map Rotation - Training 4",
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
    },
    

  },
  virEnvsLayers: [
    {
      envName: "VirEnv_1",
      layerName: "VirEnv_1",
      img_url: "assets/vir_envs_layers/VirEnv_1.png"
    },
    {
      envName: "VirEnv_2",
      layerName: "VirEnv_2",
      img_url: "assets/vir_envs_layers/VirEnv_2.png"
    }, {
      envName: "Zoom Pre - Initial",
      layerName: "VirEnv_3",
      img_url: "assets/vir_envs_layers/VirEnv_3.png"
    }, {
      envName: "Zoom Pre Easy",
      layerName: "VirEnv_4",
      img_url: "assets/vir_envs_layers/VirEnv_4_zoom1.png"
    }, {
      envName: "Zoom Pre Difficult",
      layerName: "VirEnv_5",
      img_url: "assets/vir_envs_layers/VirEnv_5_zoom1.png"
    }, {
      envName: "Location Marker - Post Difficult",
      layerName: "VirEnv_6",
      img_url: "assets/vir_envs_layers/VirEnv_6.png"
    }, {
      envName: "Location Marker - Post Easy",
      layerName: "VirEnv_7",
      img_url: "assets/vir_envs_layers/VirEnv_7.png"
    }, {
      envName: "Location Marker - Pre Difficult",
      layerName: "VirEnv_8",
      img_url: "assets/vir_envs_layers/VirEnv_8.png"
    }, {
      envName: "Location Marker - Pre Easy",
      layerName: "VirEnv_9",
      img_url: "assets/vir_envs_layers/VirEnv_9.png"
    }, {
      envName: "Location Marker - Training 1",
      layerName: "VirEnv_10",
      img_url: "assets/vir_envs_layers/VirEnv_10.png"
    }, {
      envName: "Location Marker - Training 2",
      layerName: "VirEnv_11",
      img_url: "assets/vir_envs_layers/VirEnv_11.png"
    }, {
      envName: "Map Rotation - Post Difficult",
      layerName: "VirEnv_12",
      img_url: "assets/vir_envs_layers/VirEnv_12.png"
    }, {
      envName: "Map Rotation - Post Easy 1",
      layerName: "VirEnv_13",
      img_url: "assets/vir_envs_layers/VirEnv_13.png"
    }, {
      envName: "Map Rotation - Post Easy 2",
      layerName: "VirEnv_14",
      img_url: "assets/vir_envs_layers/VirEnv_14.png"
    }, {
      envName: "Map Rotation - Pre Difficult",
      layerName: "VirEnv_15",
      img_url: "assets/vir_envs_layers/VirEnv_15.png"
    }, {
      envName: "Map Rotation - Pre Easy 1",
      layerName: "VirEnv_16",
      img_url: "assets/vir_envs_layers/VirEnv_16.png"
    }, {
      envName: "Map Rotation - Pre Easy 2",
      layerName: "VirEnv_17",
      img_url: "assets/vir_envs_layers/VirEnv_17.png"
    }, {
      envName: "Map Rotation - Training 1",
      layerName: "VirEnv_18",
      img_url: "assets/vir_envs_layers/VirEnv_18.png"
    }, {
      envName: "Map Rotation - Training 2",
      layerName: "VirEnv_19",
      img_url: "assets/vir_envs_layers/VirEnv_19.png"
    }, {
      envName: "Map Rotation - Training 3",
      layerName: "VirEnv_20",
      img_url: "assets/vir_envs_layers/VirEnv_20.png"
    }, {
      envName: "Map Rotation - Training 4",
      layerName: "VirEnv_21",
      img_url: "assets/vir_envs_layers/VirEnv_21.png"
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
