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
var position, error, isGettingResponse;

function radians(degrees) {
  return degrees * (Math.PI / 180);
}
function degrees(radians) {
  return radians * (180 / Math.PI);
}

// source: http://www.movable-type.co.uk/scripts/latlong.html
// harvesine formula
function distanceBetween2Coordinates(lastPosition, newPosition) {
  var R = 6371000; // metres
  var φ1 = radians(lastPosition.lat);
  var φ2 = radians(newPosition.lat);
  var Δφ = radians(newPosition.lat-lastPosition.lat);
  var Δλ = radians(newPosition.lng-lastPosition.lng);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);

  var angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var distance = R * angularDistance;
  return distance; // meters
}

function checkNewPosition(data, callback) {
  return function (newPosition) {
    isGettingResponse = false;

    position = {
      lat: newPosition.coords.latitude,
      lng: newPosition.coords.longitude
    };

    var distance = distanceBetween2Coordinates(data.realLastPosition, position);

    var minimumDistance = data.minimumDistance || newPosition.coords.accuracy || 50;

    if((!data.realLastPosition.lat && !data.realLastPosition.lng)
      || (distance > minimumDistance)) {

      callback(position);
    }
  };
}

function onError(callback) {

  return function (error) {
    isGettingResponse = false;
    var errorText;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error("User denied the request for Geolocation.");
        errorText = '';
        break;
      case error.POSITION_UNAVAILABLE:
        console.error("Location information is unavailable.");
        errorText = 'Não foi possível encontrar a sua localização. Posição indisponível. Entrada da UFAM foi colocado como ponto de partida.';
        break;
      case error.TIMEOUT:
        console.error("The request to get user location timed out.");
        errorText = 'Não foi possível encontrar a sua localização. Tempo de espera esgotado. Entrada da UFAM foi colocado como ponto de partida.';
        break;
      case error.UNKNOWN_ERROR:
        console.error("An unknown error occurred.");
        errorText = 'Não foi possível encontrar a sua localização. Entrada da UFAM foi colocado como ponto de partida.';
        break;
    }
    callback(errorText);
  }
}

// When it gets the new position, I want to check if has a minimum distance btw
// last position
function getGeolocation(data, callbackSuccess, callbackError) {
  var getNewPosition = checkNewPosition(data, callbackSuccess);
  var getError = onError(callbackError);
  if(navigator.geolocation) {

    isGettingResponse = true;

    navigator.geolocation.getCurrentPosition(getNewPosition, getError, {
      enableHighAccuracy: true,
      timeout: data.timeout || 10000,
      maximumAge: 0
    });
  }
}

function watchGeolocation(data, callbackSuccess, callbackError) {
  var interval = setInterval(function () {
    if(!isGettingResponse) {
      getGeolocation(data, callbackSuccess, callbackError);
    }
  }, data.intervalTime);
}

module.exports = {
  "getGeolocation": getGeolocation,
  "watchGeolocation": watchGeolocation
}