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

// Retrieve user geolocation by browser(for tests) and cordova

var position, error, callback, isPositionUpdated, isErrorRaised;

function getNewPosition(data) {
  position = {
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  };
  isPositionUpdated = true;
}

function getError(error) {
  isErrorRaised = true;
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.error("User denied the request for Geolocation.");
      error = 'Usuário negou pedido';
      break;
    case error.POSITION_UNAVAILABLE:
      console.error("Location information is unavailable.");
      error = 'Não foi possível encontrar a sua localização. Posição indisponível. Entrada da UFAM foi colocado como ponto de partida.';
      break;
    case error.TIMEOUT:
      console.error("The request to get user location timed out.");
      error = 'Não foi possível encontrar a sua localização. Tempo de espera esgotado. Entrada da UFAM foi colocado como ponto de partida.';
      break;
    case error.UNKNOWN_ERROR:
      console.error("An unknown error occurred.");
      error = 'Não foi possível encontrar a sua localização. Erro desconhecido. Entrada da UFAM foi colocado como ponto de partida.';
      break;
  }
}

function getGeolocation(callback) {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getNewPosition, getError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }
  isPositionUpdated = false;
  isErrorRaised = false;

  /*
  It seems is set to loop infinitely but is based that getCurrentPosition will
  always return something, the position or error. Maximum time = timeout.
  */
  var interval = setInterval(function () {
    if(isPositionUpdated) {
      callback(position);
      clearInterval(interval);
    } else if(isErrorRaised) {
      callback(error);
      clearInterval(interval);
    }
  }, 1000);
}

module.exports = {
  "getGeolocation": getGeolocation
}