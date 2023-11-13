import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";
import mapboxgl from "mapbox-gl";
import { virEnvLayers } from "src/app/models/virEnvsLayers";
import { environment } from "src/environments/environment";
import { SatControl } from "../../create-game/form-elements/map/SatControl/SatControl";
import { TrackerService } from "src/app/services/tracker.service";
import { UtilService } from "src/app/services/util.service";

@Component({
  selector: "app-game-tracks-visualization",
  templateUrl: "./game-tracks-visualization.page.html",
  styleUrls: ["./game-tracks-visualization.page.scss"],
})
export class GameTracksVisualizationPage implements OnInit {
  @ViewChild("map") mapContainer;
  map: mapboxgl.Map;
  marker: mapboxgl.Marker;

  // ToDo: add list of tasks numbers with event to update virenv type as well as task no
  trackWaypoints: any;
  trackTaskNumbers = [];
  selectedTaskNo = 1;
  speedValue = 50;
  virEnvType: string = "VirEnv_1";
  timer: NodeJS.Timeout;

  //* variables sent
  @Input() trackId: string;
  @Input() isVRWorld: boolean;

  list_colors = [
    "red",
    "black",
    "blue",
    "yellow",
    "green",
    "White",
    "brown",
    "#6b8e23 ",
    "#00008b",
    "#dc143c",
    "#ff00ff",
    "#00FFFF",
    "#cd853f",
  ];

  constructor(
    public modalController: ModalController,
    private trackService: TrackerService,
    private utilService: UtilService
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.getTrackWaypoints(this.trackId);
  }

  ngOnDestroy(): void {
    this.removeMap();
  }

  // get all waypoints and events
  getTrackWaypoints(trackId: string) {
    this.trackService
      .getGameTrackWaypointsandEventsById(trackId)
      .then((res: any) => res.content)
      .then((trackData) => {
        let waypointsLength = trackData.waypoints.length;

        if (waypointsLength > 10) {
          this.trackWaypoints = trackData;

          this.initMap();
        } else {
          //* show toast msg and dismiss model
          this.dismissModal();
          this.utilService.showToast(
            `The number of selected track waypoints are not enough to show it on map.`,
            "dark",
            3500
          );
        }
      });
  }

  initMap() {
    mapboxgl.accessToken = environment.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: this.isVRWorld
        ? environment.mapStyle +
          (virEnvLayers[this.virEnvType].satellite
            ? virEnvLayers[this.virEnvType].satellite
            : this.virEnvType) +
          ".json"
        : environment.mapStyle + "realWorld.json",
      center: this.isVRWorld
        ? [0.005810510811 / 2, 0.006827038669 / 2]
        : [8, 51.8],
      zoom: this.isVRWorld ? 15.5 : 2,
      // maxBounds: (this.isVRWorld ? bounds : null) // Sets bounds as max
      maxBounds: this.isVRWorld ? virEnvLayers[this.virEnvType].bounds : null, // Sets bounds
    });

    /* Show satelitte control only with real world */
    if (!this.isVRWorld) {
      this.map.addControl(new SatControl());
    }

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on("load", () => {
      this.map.resize();

      // disable map rotation using right click + drag
      this.map.dragRotate.disable();

      // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.disableRotation();

      // show flags
      this.addFlags();

      // show routes
      this.showRoutes();
    });
  }

  changeSpeed(value) {
    if (value == "High") {
      this.speedValue = 50;
    } else if (value == "Medium") {
      this.speedValue = 400;
    } else {
      this.speedValue = 600;
    }
  }

  addFlags() {
    // throw new Error("Method not implemented.");
    let initialPosition = false;
    this.trackWaypoints.events.forEach((event) => {
      if (event.task && event.task.category == "nav") {
        if (!initialPosition) {
          initialPosition = true;
        }
        this.addMarker("waypoint-marker", event.task.answer.position.geometry.coordinates)
        console.log("nav Task");
      }
    });
  }

  // show routes
  showRoutes() {
    //AddTaskMarker(taskValue);

    this.deleteSourceAndLayer();

    let coords = [];

    this.trackWaypoints.waypoints.forEach((waypoint) => {
      //* since some points e.g. first one doesn't have coords
      if (waypoint.position) {
        coords.push([
          waypoint.position.coords.longitude,
          waypoint.position.coords.latitude,
        ]);
      }
    });
    this.createSourceandAndLayer(coords);
    // }
  } //end showRoutes

  createSourceandAndLayer(coords) {
    // let colorIndex = Math.floor(Math.random() * this.list_colors.length); // set color randomly from list
    let colorIndex = 0; // set color randomly from list

    const waypoints_data = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        },
      ],
    };

    // add source and layer
    this.map.addSource(`trace`, {
      type: "geojson",
      data: waypoints_data,
    });
    this.map.addLayer({
      id: `trace`,
      type: "line",
      source: `trace`,
      paint: {
        "line-color": this.list_colors[colorIndex],
        //'line-color': list_colors[index],
        //'line-color': 'black',
        "line-opacity": 0.75,
        "line-width": 1.5,
      },
    });

    // save full coordinate list for later
    const coordinates = waypoints_data.features[0].geometry.coordinates;

    // start by showing just the first coordinate
    waypoints_data.features[0].geometry.coordinates = [coordinates[0]];

    // setup the viewport TODO
    this.map.jumpTo({ 'center': coordinates[0], 'zoom': 16.8 });
    // this.map.setPitch(30);

    // on a regular basis, add more coordinates from the saved list and update the map
    let i = 0;
    this.timer = setInterval(() => {
      if (i < coordinates.length) {
        waypoints_data.features[0].geometry.coordinates.push(coordinates[i]);
        this.map.getSource("trace").setData(waypoints_data);
        //map.panTo(coordinates[i]);
        i++;
        console.log(
          "🚀 ~ file: game-tracks-visualization.page.ts:226 ~ timer ~ i:",
          i
        );
      } else {
        window.clearInterval(this.timer);
        console.log("🚀 ~ file: clearInterval.");
      }
    }, this.speedValue);
  } // end createSourceandLayer

  deleteSourceAndLayer() {
    console.log("delete function");
    if (this.map.getLayer(`trace`)) {
      this.map.removeLayer(`trace`);
      this.map.removeSource(`trace`);
      console.log("delete source");
    }
  }

  dismissModal() {
    //* in case track visualization was interepted.
    window.clearInterval(this.timer);

    this.modalController.dismiss({
      dismissed: true,
      data: {},
    });
  }

  // add flags and user initial position
  addMarker(markerType, coord) {
    const el = document.createElement("div");
    if (markerType != "circle") {
      el.className = "waypoint-marker";
    } else {
      el.className = "circle-marker";
    }

    this.marker = new mapboxgl.Marker(el, {
      anchor: "bottom",
      offset: markerType == "circle" ? [0, 15] : [15, 0],
      draggable: true,
    })
      .setLngLat(coord)
      .addTo(this.map);
  }

  removeMap() {
    if (this.map) {
      this.map.remove();
    }
  }
}
