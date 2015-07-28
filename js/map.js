/*!
 *< CampusMap - UFAM's Campus Map App with own route system >
 *Copyright (C) <2015>  <Cyfth - jackson@cyfth.com - cyfth.com>>
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
var RotatedMarker = require('./RotatedMarker.js');
var Geolocation = require('./geolocation.js');
var Locations = require('./locations.js');
var Icons = require('./icons.js');
var map = new Leaflet.map('map', {
  zoomControl: false
});

var searchInput = document.getElementById('search_input');
var searchButton = document.getElementById('search_button');
var bounds = [[-3.0805, -59.9467], [-3.1074, -59.9873]];
var sourceMarker, destinationMarker;
var sourcePosition, destinationPosition;
var isInsideUfam;
var routePath;

function resolvePosition(data) {
  if (data.latitude < bounds[0][0] && data.latitude > bounds[1][0] &&
    data.longitude < bounds[0][1] && data.longitude > bounds[1][1]) {
    isInsideUfam = true;
    return [data.latitude, data.longitude];

  } else {
    isInsideUfam = false;
    return [-3.101187, -59.9825066];
    //'Ops! A sua localização está fora dos limites da UFAM. Então colocamos
    // como ponto de partida, a entrada da UFAM.'
  }
}

function setDestinationMarker() {
  var searchText = searchInput.value;
  if(searchText != "") {
    //console.log(searchText);
    var position = Locations.getPosition(searchText);

    if(position.latitude != 0 && position.longitude != 0) {
      destinationPosition = [position.latitude, position.longitude];
      destinationMarker.setLatLng([position.latitude, position.longitude])
        .setPopupContent(searchText)
        .openPopup();

      var route = [sourcePosition, destinationPosition];
      console.log(route);
      if(routePath) {
        routePath.setLatLngs(route);
      } else {
        routePath = Leaflet.polyline(route, {color: 'blue'}).addTo(map);
      }
    }
  }
}

function compassSuccess(heading) {
  if(sourceMarker) {
    console.log("Compass: " + heading.magneticHeading);
    sourceMarker.setAngle(heading.magneticHeading);
  }
}

function compassError(error) {
  console.log('Compass error: ' + compassError.code);
}

function watchDeviceOrientation() {
  if(navigator.compass) {
    var watchID = navigator.compass.watchHeading(compassSuccess, compassError, {frequency:3000});
  }
}

function initialize() {
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

  map.setView([-3.0929649, -59.9661264], 15);

  var zoomControl = Leaflet.control.zoom({position: "bottomleft"});
  map.addControl(zoomControl);
  // This limit the user from go elsewhere beyond bounds
  map.setMaxBounds(bounds);

  // Out of user range just to initialize
  destinationMarker = Leaflet.marker([90,120])
    .addTo(map)
    .bindPopup('Destino')
    .openPopup();

  Geolocation.getGeolocation(function (data) {
    if(typeof data == "object") {
      sourcePosition = resolvePosition(data);
      var sourcePopup = isInsideUfam ? 'Você está aqui!' : 'Entrada da UFAM';
      sourceMarker = RotatedMarker.create(sourcePosition, {icon: Icons.navigatorIcon})
        .addTo(map)
        .bindPopup(sourcePopup)
        .openPopup();

      //sourceMarker.setAngle(60);
      watchDeviceOrientation();

    } else {
      // Error
      console.log(data);
    }
  });
}

module.exports = {
  "initialize": initialize
}