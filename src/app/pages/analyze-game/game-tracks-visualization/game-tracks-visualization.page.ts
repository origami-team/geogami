import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";
import mapboxgl from "mapbox-gl";
import { virEnvLayers } from "src/app/models/virEnvsLayers";
import { environment } from "src/environments/environment";
import { SatControl } from "../../create-game/form-elements/map/SatControl/SatControl";
import { TrackerService } from "src/app/services/tracker.service";

@Component({
  selector: "app-game-tracks-visualization",
  templateUrl: "./game-tracks-visualization.page.html",
  styleUrls: ["./game-tracks-visualization.page.scss"],
})
export class GameTracksVisualizationPage implements OnInit {
  @ViewChild("map") mapContainer;
  map: mapboxgl.Map;

  // ToDo: add list of tasks numbers with event to update virenv type as well as task no
  trackWaypoints: any;
  trackTaskNumbers = [];
  selectedTaskNo = 1;
  speedValue = 50;
  virEnvType: string = "VirEnv_1";

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
    private trackService: TrackerService
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.getTrackWaypoints(this.trackId);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  getTrackWaypoints(trackId: string) {
    this.trackService
      .getGameTrackWaypointsById(trackId)
      .then((res: any) => res.content)
      .then((trackData) => {
        console.log(
          "🚀 ~ ---file: game-tracks-visualization.page.ts:58 ~ GameTracksVisualizationPage ~ .then ~ trackData:",
          trackData
        );
        this.trackWaypoints = trackData.waypoints;
        if (trackData.taskNumbers) {
          this.trackTaskNumbers = trackData.taskNumbers;
          this.selectedTaskNo = this.trackTaskNumbers[0];

          this.initMap();
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

      // show routes
      this.showRoutes();
    });
  }

  changeTaskNo(taskNo) {
    this.selectedTaskNo = taskNo;
    this.showRoutes();
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

  // show routes
  showRoutes() {
    //AddTaskMarker(taskValue);

    this.deleteSources();

    // for (let i = 1; i <= 1; i++) {
    let coords = [];
    //console.log("player", tracks_vr1[i].players);
    //console.log("i: ", i);
    console.log(
      "🚀 ~ file: game-tracks-visualization.page.ts:3661 ~ .then ~ this.trackWaypoints:",
      this.trackWaypoints
    );

    console.log("🚀 ~~~~~~ this.selectedTaskNo:", this.selectedTaskNo);
    this.trackWaypoints.forEach((waypoint) => {
      // tracks_vr1[i].waypoints.forEach((waypoint) => {
      if (waypoint.task_no == this.selectedTaskNo) {
        //TODO: change taskno to num
        coords.push([waypoint.longitude, waypoint.latitude]);
        //console.log("task no true: ", taskValue);
      }
    });
    this.createSourceandLayer(coords);
    // }
  } //end showRoutes

  createSourceandLayer(coords) {
    let colorIndex = Math.floor(Math.random() * this.list_colors.length); // set color randomly from list
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
    //console.log("waypoints_data.features[0].geometry.coordinates: ", waypoints_data.features[0].geometry.coordinates);

    // start by showing just the first coordinate
    waypoints_data.features[0].geometry.coordinates = [coordinates[0]];
    //console.log("[coordinates[0]]: ", [coordinates[0]]);

    // setup the viewport TODO
    //map.jumpTo({ 'center': coordinates[0], 'zoom': 16.8 });
    //map.setPitch(30);

    // on a regular basis, add more coordinates from the saved list and update the map
    let i = 0;
    const timer = setInterval(() => {
      if (i < coordinates.length) {
        waypoints_data.features[0].geometry.coordinates.push(coordinates[i]);
        this.map.getSource("trace").setData(waypoints_data);
        //map.panTo(coordinates[i]);
        i++;
        /* if ( i == coordinates.length - 1) {  ToDo: update it to the end of execution
                    // enable `show track` button
                    document.getElementById("showTrackBtn").disabled = false;
                } */
      } else {
        window.clearInterval(timer);
      }
    }, this.speedValue);
  } // end createSourceandLayer

  deleteSources() {
    console.log("delete function");
    if (this.map.getLayer(`trace`)) {
      this.map.removeLayer(`trace`);
      this.map.removeSource(`trace`);
      console.log("delete source");
    }
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true,
      data: {},
    });
  }
}
