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

module.exports = {
  'getLocationsName': getLocationsName
}