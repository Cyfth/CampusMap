/*!
 *< CampusMap - UFAM's Campus Map App with own route system >
 *Copyright (C) <2015>  <Jackson Lucas <jackson7br@gmail.com>>
 *
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Affero General Public License as published
 *by the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU Affero General Public License for more details.
 *
 *You should have received a copy of the GNU Affero General Public License
 *along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Leaflet = require('Leaflet');
var Icons = require('./leaflet-sprite.js');
var Provider = require('./leaflet-providers.js');
var TileLayer = require('./L.TileLayer.PouchDB.js');
var Geolocation = require('./geolocation.js');
var Locations = require('./locations.js');
var RouteSystem = require('./routeSystem.js');
var IconManager = require('./iconManager.js');
var RotatedMarker = require('./rotatedMarker.js');
var Notification = require('./notification.js');
var UserMarker = require('../leaflet-usermaker/leaflet.usermarker.js');
var Page = require('page');
var map = new Leaflet.map('map', {
  zoomControl: false

});

var searchInput = document.getElementById('search_input');
var searchButton = document.getElementById('search_button');
var searchBar = document.getElementById('search_bar');
var bounds = [[-3.0805, -59.9467], [-3.1074, -59.9873]];
var destinationName;
var sourceMarker, destinationMarker;
var destinationPosition;
var isInsideUfam;
var routePath;
var firstTimeGeolocation = true;
var createRoutePending = false;
var zoomControl;

var geolocationData = {
  realLastPosition: {lat: undefined, lng: undefined},
  lastPosition: {lat: undefined, lng: undefined},
  intervalTime: 4000, // ms
  minimumDistance: 25 // meters
}

function resolvePosition(data) {
if (data.lat < bounds[0][0] && data.lat > bounds[1][0] &&
    data.lng < bounds[0][1] && data.lng > bounds[1][1]) {
    isInsideUfam = true;
    console.log("NEW SOURCE");
    console.log(data);
    return {
      lat: data.lat,
      lng: data.lng
    };

  } else {
    isInsideUfam = false;
    return {
      lat: -3.101187,
      lng: -59.9825066
    };
    //'Ops! A sua localização está fora dos limites da UFAM. Então colocamos
    // como ponto de partida, a entrada da UFAM.'
  }
}

function setDestinationMarker (event) {
  var searchText = searchInput.value;

  if(event) {
    event.preventDefault();
  }

  if(searchText != "") {

    var position = Locations.getPosition(searchText);

    if(position.latitude != 0 && position.longitude != 0) {

      destinationPosition = [position.latitude, position.longitude];
      destinationMarker.setLatLng([position.latitude, position.longitude])
        .setPopupContent(searchText)
        .openPopup();

      destinationName = searchText;
      console.log(destinationName);

      if(geolocationData.lastPosition.lat && geolocationData.lastPosition.lat) {
        console.log('calling route');
        createRoute();
      } else {
        createRoutePending = true;
      }
    }
  }
}

function createRoute () {
  var location = {
    lat: geolocationData.lastPosition.lat,
    lng: geolocationData.lastPosition.lng
  }

  var route = RouteSystem.getRoute(location, destinationName);
  console.log("ROTA");
  console.log(route);
  if(routePath) {
    routePath.setLatLngs(route);
  } else {
    routePath = Leaflet.polyline(route, {color: 'blue'}).addTo(map);
  }
}

function setSourceMarker (position) {

  geolocationData.realLastPosition = position;
  geolocationData.lastPosition = resolvePosition(position);
  console.log("LAST POSITION");
  console.log(geolocationData.lastPosition);

  var sourcePopup;

  if(isInsideUfam) {
    sourcePopup = 'Você está aqui!';
  } else {
    sourcePopup = 'Entrada da UFAM';

    if(firstTimeGeolocation) {

      Notification.showNotification('Ops! A sua localização está fora dos limites da UFAM. Então colocamos como ponto de partida, entrada da UFAM.','alert-info');
      firstTimeGeolocation = false;
    }
  }


  if(sourceMarker === undefined) {

    sourceMarker = UserMarker.create(geolocationData.lastPosition
    , {pulsing: true, accuracy: 65, smallIcon:true})
      .addTo(map)
      .bindPopup(sourcePopup)
      .openPopup();

  } else {
    sourceMarker.setLatLng(geolocationData.lastPosition);
  }

  if(createRoutePending) {
    createRoute();
  }

}

function geolocationError(error) {
  // show notification
  if(error) {
    // Entrada da UFAM
    setSourceMarker({
      lat: -3.101187,
      lng: -59.9825066
    });
    if(firstTimeGeolocation) {
      firstTimeGeolocation = false;
      Notification.showNotification(error, 'alert-warning');
    }
  }
}

function redirect () {
  if(searchInput.value != "") {
    var structure = searchInput.value.replace(/ /g, '+');
    var path = '#!/estrutura/' + structure;
    console.log(path);
    console.log('updated')
    // map.removeControl(zoomControl);
    // map.removeLayer(destinationMarker);
    var state = { 'page_id': 1, 'path': path };
    var title = 'CampusMap - ' + searchInput.value;
    var url = path;

    history.pushState(state, title, url);
    // Page(path);
    setDestinationMarker();
  }
}

function initialize () {
  console.log("path:"+Leaflet.Icon.Default.imagePath);
  Leaflet.Icon.Default.imagePath = 'images';
  console.log("path:"+Leaflet.Icon.Default.imagePath);
  // Leaflet.Icon.Default.imagePath = './css/leaflet/images';
  RouteSystem.initialize();

  searchButton.addEventListener("click", redirect, false);
  searchBar.addEventListener("submit", redirect, false);
  document.addEventListener("searchbutton", redirect, false);



  searchInput.addEventListener("click", function () {
    searchInput.value = "";
  });

  Leaflet.Icon.Default.imagePath = './css/leaflet/images';

  // bounds limit the tiles to download just for the bound area.
  Leaflet.tileLayer.provider('MapBox', {
    id: 'jackson7am.pkpiakpa',
    accessToken: 'pk.eyJ1IjoiamFja3NvbjdhbSIsImEiOiJjaW10aHNyNDAwMXp5dXdtNGdjcXFqYm5rIn0.EWpAPF0UxZRcwU6yyEkFEw',
    useCache: true
  }).addTo(map);

  if(!zoomControl) {
    zoomControl = Leaflet.control.zoom({position: "bottomleft"});

    map.addControl(zoomControl);
  }

  // This limit the user from go elsewhere beyond bounds
  map.setMaxBounds(bounds);

  // Out of user range just to initialize
  destinationMarker = Leaflet.marker([0,0], {icon: Leaflet.spriteIcon("blue")})
    .addTo(map)
    .bindPopup('Destino')
    .openPopup();

  Geolocation.getGeolocation(geolocationData, setSourceMarker, geolocationError);

  Notification.initialize();

  map.setView([-3.0929649, -59.9661264], 15);
}

function setDestinationByLink(structure) {
    searchInput.value = structure.replace(/\+/g, ' ');;
    setDestinationMarker();
}

module.exports = {
  "initialize": initialize,
  "setDestinationByLink": setDestinationByLink
}