import { Component, OnInit, ViewChild } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

// VR world
import { ActivatedRoute } from '@angular/router';
// For getting user role
import { AuthService } from '../../../services/auth-service.service';
import { environment } from 'src/environments/environment';

import mapboxgl from "mapbox-gl";
import { cloneDeep } from "lodash";
import { UtilService } from 'src/app/services/util.service';
// import {} from environment.mapStyle + 'realWorld.json'


@Component({
  selector: 'app-play-game-list',
  templateUrl: './play-game-list.page.html',
  styleUrls: ['./play-game-list.page.scss']
})
export class PlayGameListPage implements OnInit {
  @ViewChild("gamesMap") mapContainer;
  @ViewChild("popupContainer") popupContainer: any;

  games: any;
  gamesTemp: any;
  gamesWithLocs: any;
  // VR world
  isVirtualWorld: boolean = false;
  // To be able to update games list and switch between segments 
  searchText: string = "";
  selectedSegment: string = "curated";
  // to disable mine segment for unlogged user
  userRole: String = "unloggedUser";
  user = this.authService.getUserValue();

  isVRMirrored: boolean = false; // temp
  map: mapboxgl.Map;
  isListTabSelected: boolean = true;

  //temp
  popup: any;
  game_id: any;
  game_name: any;
  game_place: any;
  game_numTasks: any;


  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    // if device is not connected to internet, show notification
    if (!this.utilService.getIsOnlineValue()) {
      // show no connection notification
      this.utilService.showAlertNoConnection();
      // return;
    }

    
    // VR world
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      if (params.worldType === "VRWorld") {
        this.isVirtualWorld = true;
      }
    });

    // Check user role
    if (this.user) {
      this.selectedSegment = "all";
      this.userRole = this.user['roles'][0];
    }

    // Get games data from server
    this.getGamesData();

    
  }

  ngAfterViewInit(): void {
  }

  // Get games data from server
  getGamesData() {
    this.gamesService.getGames(true).then(res => res.content).then(games => {
      // Get either real or VE agmes based on selected environment 
      this.games = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))).reverse();
      //this.gamesTemp = cloneDeep(this.games);
      this.gamesTemp = this.games;

      if(this.selectedSegment == "curated"){
        // Filter data of selected segment
        this.segmentChanged(this.selectedSegment)
      }
    });
  }

  // ToDo: update the functions
  doRefresh(event) {
    // Get games data from server
    this.gamesService.getGames(true).then(res => res.content).then(games => {
      // Get either real or VE agmes based on selected environment 
      this.games = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))).reverse();
      //this.gamesTemp = cloneDeep(this.games);
      this.gamesTemp = this.games;

      // Filter data of selected segment
      this.segmentChanged(this.selectedSegment)
    }).finally(() => event.target.complete());;
  }

  // search function
  filterList(event) {
    this.filterSelectedSegementList(event.detail.value);
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`play-game/game-detail/${game._id}`);
  }

  // segment (my games - all games - curated game)
  segmentChanged(segVal) {  //--- ToDo check duplicate code and create a func for it
    // if mine is selected
    if (segVal == "mine") {
      // console.log("mine"); //temp
      this.games = this.gamesTemp.filter(game => game.user == this.user['_id']);

      // to update shown games based on search phrase
      if (this.searchText != "") {
        this.games = this.games.filter(game =>
        (game.name.toLowerCase().includes(this.searchText.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(this.searchText.toLowerCase())))
        )
      }
    } else if (segVal == "all") { // if all is selected
      //onsole.log("all"); //temp
      this.games = this.gamesTemp;

      // to update shown games based on search phrase
      if (this.searchText != "") {
        this.games = this.games.filter(game =>
        (game.name.toLowerCase().includes(this.searchText.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(this.searchText.toLowerCase())))
        )
      }
    }
    else if (segVal == "curated") { // if all is selected
      //console.log("curated");
      this.games = this.gamesTemp.filter(game => game.isCuratedGame == true);

      // to update shown games based on search phrase
      if (this.searchText != "") {
        this.games = this.games.filter(game =>
        (game.name.toLowerCase().includes(this.searchText.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(this.searchText.toLowerCase())))
        )
      }
    }
  }

  // update list after selecting a segment
  filterSelectedSegementList(searchPhrase) {
    if (this.selectedSegment == "all") {
      this.games = this.gamesTemp.filter(game =>
      (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
        || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
      )
    } else if (this.selectedSegment == "mine") {
      this.games = this.gamesTemp.filter(game =>
        (game.user == this.user['_id']) &&
        (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
      )
    }
    else if (this.selectedSegment == "curated") {
      this.games = this.gamesTemp.filter(game =>
        (game.isCuratedGame == true) &&
        (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
      )
    }
  }

  //
  initMap(gamesPoints) {
    mapboxgl.accessToken = environment.mapboxAccessToken;
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: environment.mapStyle + 'realWorld.json',
      // style: 'mapbox://styles/mapbox/light-v9',
      // style: 'mapbox://styles/mapbox/light-v10',
      // style: 'mapbox://styles/mapbox/streets-v11',
      center: [8, 51.8],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18  // to avoid error
    });

    // disable map rotation using right click + drag
    this.map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    this.map.touchZoomRotate.disableRotation();
    // Add zomm in/out controls
    this.map.addControl(new mapboxgl.NavigationControl());

    //Temp
    this.map.on('load', () => {
      // Load an image from an external URL pr assets
      this.map.loadImage(
        "assets/icons/icon-72x72.png",
        //"/assets/icons/marker-editor-solution.png",
        (error, image) => {
          if (error) throw error;
          // Add the image to the map style.
          this.map.addImage("geogami-marker", image);
        }
      );

      // Add a new source from our GeoJSON data and
      // set the 'cluster' option to true. GL-JS will
      // add the point_count property to your source data.
      this.map.addSource('earthquakes', {
        type: 'geojson',
        data: {
          'type': 'FeatureCollection',
          'features': gamesPoints
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#51bbd6',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            5, 2,
            10, 7,
            15, 20,
            20, 30,
            25
          ],
          "circle-opacity": 0,
          "circle-stroke-width": 12,
          "circle-stroke-color": '#51bbd6',
          "circle-stroke-opacity": 0.85
        }
      });

      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 20,
        }
      });

      // Add a layer showing game pont
      this.map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: {
          "icon-image": "geogami-marker",
          "icon-size": 0.75,
          "icon-offset": [0, 0],
          "icon-allow-overlap": true,
        }
      });

      // inspect a cluster on click
      this.map.on('click', 'clusters', (e) => {
        const features = this.map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        this.map.getSource('earthquakes').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;

            this.map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      this.map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        this.popup = e.features[0].properties;

        // Data to send topopup component
        this.game_id = e.features[0].properties._id;
        this.game_name = e.features[0].properties.name;
        this.game_place = e.features[0].properties.place;
        this.game_numTasks = e.features[0].properties.task_num;
        //console.log('properties: ', e.features[0].properties)

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        this.popup = new mapboxgl.Popup({
          //closeButton: false
        })
          .setLngLat(coordinates)
          .setDOMContent(this.popupContainer.nativeElement)
          .addTo(this.map);
      });

      //--- ToDo (imp) use one func mouseenter for both cluster and point
      // Change the cursor to a pointer when the mouse is over the cluster layer.
      this.map.on('mouseenter', 'clusters', (e) => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'clusters', () => {
        this.map.getCanvas().style.cursor = '';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'unclustered-point', () => {
        this.map.getCanvas().style.cursor = '';
      });

      // Change the cursor to a pointer when the mouse is over the game layer.
      this.map.on('mouseenter', 'unclustered-point', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
    });

  }

  async openMapTap() {
    if (this.isListTabSelected) {
      this.isListTabSelected = false;

      // get minimal games with locs
      this.gamesService.getMinimalGamesWithLocs().then(res => res.content).then(gameswithlocs => {
        // Get either real or VE agmes based on selected environment 
        this.gamesWithLocs = gameswithlocs.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))).reverse();

        // console.log("gamesWithLocs: ", this.gamesWithLocs);

        this.convertToGeoJson()
      });
    }
  }

  openListTap() {
    if (!this.isListTabSelected) {
      this.isListTabSelected = true;
    }
  }

  async convertToGeoJson() {
    let convertedData = []

    //console.log("convertedData: ", convertedData)

    this.gamesWithLocs.forEach(game => {
      if (game.coords) {
        convertedData.push({
          'type': 'Feature',
          'properties': {
            '_id': game._id,
            'name': game.name,
            'place': game.place,
            'task_num': game.task_num,
          },
          'geometry': {
            'type': 'Point',
            'coordinates': game.coords
          }
        })
      }
    });

    console.log("convertedData: ", convertedData)
    this.showGamesOnMap(convertedData);
  }

  showGamesOnMap(gamesListGeoJson) {

    if (!this.map) {
      console.log("Create map ////////////");
      this.initMap(gamesListGeoJson);
    }
    else if (this.map.getLayer('places')) {
      this.map.removeLayer(`places`);
      this.map.removeSource("places");

      console.log("Else ////////////");

      this.map.addSource('places', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': gamesListGeoJson
        }
      });

      // Add a layer showing the places.
      this.map.addLayer({
        'id': 'places',
        type: "symbol",
        'source': 'places',
        layout: {
          "icon-image": "geogami-marker",
          "icon-size": 0.65,
          "icon-offset": [0, 0],
          "icon-allow-overlap": true,
        }
      });
    }

  }
}
