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

// Source: http://gis.stackexchange.com/questions/29239/calculate-bearing-between-two-decimal-gps-coordinates
function radians(degrees) {
  return degrees * (Math.PI / 180);
}
function degrees(radians) {
  return radians * (180 / Math.PI);
}

function getBearing(source, destination){
  source.lat = radians(source.lat);
  source.lng = radians(source.lng);
  destination.lat = radians(destination.lat);
  destination.lng = radians(destination.lng);

  var deltaLongitude = destination.lng - source.lng;

  var deltaLatitude = Math.log(Math.tan(destination.lat/2.0+Math.PI/4.0)/Math.tan(source.lat/2.0+Math.PI/4.0));
  if (Math.abs(deltaLongitude) > Math.PI){
    if (deltaLongitude > 0.0)
      deltaLongitude = -(2.0 * Math.PI - deltaLongitude);
    else
      deltaLongitude = (2.0 * Math.PI + deltaLongitude);
  }

  return (degrees(Math.atan2(deltaLongitude, deltaLatitude)) + 360.0) % 360.0;
}

module.exports = {
  'getBearing': getBearing
};