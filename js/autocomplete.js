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
var Autocomplete = require('./libraries/auto-complete.min.js');
var Locations = require('./locations.js');
var searchInput = document.getElementById('search_input');

var locationsAutoComplete, locationsName;

function initialize() {
  locationsName = Locations.getLocationsName();

  locationsAutoComplete = new Autocomplete({
     selector: searchInput,
     minChars: 2,
     source: function(term, suggest){
         term = term.toLowerCase();
         var matches = [];
         for (i=0; i<locationsName.length; i++)
             if (~locationsName[i].toLowerCase().indexOf(term)) matches.push(locationsName[i]);
         suggest(matches);
     }
 });
}


module.exports = {
  'initialize': initialize
}