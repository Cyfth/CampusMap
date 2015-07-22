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
var rawLocations = require('../data/ufam.json');
var locationsName = [];

function filterRawLocations() {
  var index;
  for(index = 0; index < rawLocations.length; index++) {
    if(rawLocations[index].properties.tags.name) {
      locationsName.push(rawLocations[index].properties.tags.name);
    }
  }
}

(function initialize() {
  filterRawLocations();
})();

function getLocationsName() {
  return locationsName;
}

function getGeometry(locationName) {
  var index;
  for(index = 0; index < locationsName; index++) {
    if(locationsName[index] == locationName) {
      return rawLocations[index].geometry;
    }
  }
}

function getPosition(locationName) {
  var locationGeometry = getGeometry(locationName);
  var axis_x = 0
  , axis_y = 0
  , coordinate
  , index;

  if(locationGeometry) {

    // It will only change the marker if it's of the following types
    if (locationGeometry.type == 'Polygon') {
      // Get the exterior ring coordinate | Don't understand? Check GeoJSON Spec!
      for (index = locationGeometry.coordinates[0].length - 1; index >= 0; index--) {

        coordinate = locationGeometry.coordinates[0];

        axis_x += coordinate[index][0];
        axis_y += coordinate[index][1];
      }

      axis_x = axis_x / locationGeometry.coordinates[0].length;
      axis_y = axis_y / locationGeometry.coordinates[0].length;

    } else if (locationGeometry.type == 'MultiPolygon') {
      // Get the exterior ring coordinate of the first polygon | For more check GeoJSON Spec
      for (index = locationGeometry.coordinates[0][0].length - 1
      ; index >= 0; index--) {

        coordinate = locationGeometry.coordinates[0][0];

        axis_x += coordinate[index][0];
        axis_y += coordinate[index][1];

      }

      axis_x = axis_x / locationGeometry.coordinates[0][0].length;
      axis_y = axis_y / locationGeometry.coordinates[0][0].length;

    } else if (locationGeometry.type == 'Point') {

      axis_x = locationGeometry.coordinates[0];
      axis_y = locationGeometry.coordinates[1];

    }
  }

  return {
    latitude: axis_y,
    longitude: axis_x
  };
}

module.exports = {
  'getPosition': getPosition,
  'getLocationsName': getLocationsName
}