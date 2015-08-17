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
var Geolocation = require('./geolocation.js');
var Locations = require('./locations.js');
var RouteSystem = require('./routeSystem.js');
var IconManager = require('./iconManager.js');
var RotatedMarker = require('./rotatedMarker.js');
var Notification = require('./notification.js');

var map = new Leaflet.map('map', {
  zoomControl: false
});

var searchInput = document.getElementById('search_input');
var searchButton = document.getElementById('search_button');
var bounds = [[-3.0805, -59.9467], [-3.1074, -59.9873]];
var destinationName;
var sourceMarker, destinationMarker;
var destinationPosition;
var isInsideUfam;
var routePath;
var firstTimeGeolocation = true;

var geolocationData = {
  realLastPosition: {lat: undefined, lng: undefined},
  lastPosition: {lat: undefined, lng: undefined},
  intervalTime: 10000, // ms
  minimumDistance: undefined // meters
}

function resolvePosition(data) {
  if (data.lat < bounds[0][0] && data.lat > bounds[1][0] &&
    data.lng < bounds[0][1] && data.lng > bounds[1][1]) {
    isInsideUfam = true;
    return data;

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

function setDestinationMarker () {
  var searchText = searchInput.value;
  if(searchText != "") {

    var position = Locations.getPosition(searchText);

    if(position.latitude != 0 && position.longitude != 0) {

      destinationPosition = [position.latitude, position.longitude];
      destinationMarker.setLatLng([position.latitude, position.longitude])
        .setPopupContent(searchText)
        .openPopup();

      destinationName = searchText;

      var route = [geolocationData.lastPosition, destinationPosition];

      createRoute();
    }
  }
}

function createRoute () {
  var location = {
    lat: geolocationData.lastPosition[0],
    lng: geolocationData.lastPosition[1]
  }

  var route = RouteSystem.getRoute(location, destinationName);

  if(routePath) {
    routePath.setLatLngs(route);
  } else {
    routePath = Leaflet.polyline(route, {color: 'blue'}).addTo(map);
  }
}

function setSourceMarker (position) {

  geolocationData.realLastPosition = position;
  geolocationData.lastPosition = resolvePosition(position);

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

    sourceMarker = RotatedMarker.create(geolocationData.lastPosition, {icon: IconManager.userIcon})
      .addTo(map)
      .bindPopup(sourcePopup)
      .openPopup();
  } else {
    sourceMarker.bearingTo(geolocationData.lastPosition).setLatLng(geolocationData.lastPosition);
  }

}

function geolocationError(error) {
  // show notification
  if(error) {
    Notification.showNotification(error, 'alert-warning');
  }
}

function initialize () {
  RouteSystem.initialize();

  searchButton.addEventListener("click", setDestinationMarker);
  searchInput.addEventListener("click", function () {
    searchInput.value = "";
  });

  Leaflet.Icon.Default.imagePath = './css/leaflet/images';

  // bounds limit the tiles to download just for the bound area.
  Leaflet.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //'bounds': bounds,
    'attribution': '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var zoomControl = Leaflet.control.zoom({position: "bottomleft"});
  map.addControl(zoomControl);
  // This limit the user from go elsewhere beyond bounds
  map.setMaxBounds(bounds);

  // Out of user range just to initialize
  destinationMarker = Leaflet.marker([0,0])
    .addTo(map)
    .bindPopup('Destino')
    .openPopup();

  Geolocation.watchGeolocation(geolocationData, setSourceMarker, geolocationError);

  Notification.initialize();

  map.setView([-3.0929649, -59.9661264], 15);
}

module.exports = {
  "initialize": initialize
}