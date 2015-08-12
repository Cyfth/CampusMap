/*!
 *routeSystem - Dijsktra route system for JSON data
 *Copyright (C) <2014>  <Jackson Lucas <jackson7br@gmail.com>>
 *
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Exist two way of search
 * Structure -> Structure
 * Location -> Structure(for example: Lat/Lng -> Cantina)
 */
var data = require('../data/privatesm.json');

module.exports = (function() {
  "use strict"

  var __private = {},
      __public = {};

  /**
   * Private Variables
   */
  __private.data = data;
  __private.visitedPoints = [];

  // -----------------------------------

  /**
   * Public Variables
   */

  // -----------------------------------

  /**
   * Private Methods
   */
  __private.getData = function () {
    __private.data = data.map(__private.valueToInfinity);
  };

  __private.valueToInfinity = function (point) {
    point.properties.value = Infinity;
    return point;
  };

  __private.onlyNotVisited = function (next_index) {
    var index;

    for(index = __private.visitedPoints.length-1; index >= 0; index--) {
      if(__private.visitedPoints[index] == next_index) {
        return false;
      }
    }

    return true;
  };

  __private.getPointsByStructureName = function (structure_name) {
    var index,
      index2,
      actualPoint,
      structures,
      structurePoints = [];

    for (index = __private.data.length-1; index >= 0; index--) {

      actualPoint = __private.data[index];

      structures = actualPoint.properties.structures;

      for(index2 = structures.length-1; index2 >= 0; index2--) {

        if (structures[index2] == structure_name) {
          structurePoints.push(index);
          break;
        }
      }
    }

    return structurePoints;
  };

  /**
   * It'll look for the exact or nearest point in data
   */
  __private.getPointByLocation = function (location) {
    var index,
      nearestPoint = [undefined, Infinity], // point_index, value
      actualPoint,
      actualDistance;

    for (index = __private.data.length-1; index >= 0; index--) {
      actualPoint = __private.data[index];

      if (actualPoint.lng == location.lng && actualPoint.lat == location.lat) {

        return [index];

      } else {

        actualDistance = __private.getDistanceBetweenLocations(location, actualPoint);

        if(actualDistance < nearestPoint[1]) {
          nearestPoint = [index, actualDistance];
        }
      }
    }

    // Return just when the exact point is not found
    return [nearestPoint[0]];
  };

  __private.getDistanceBetweenLocations = function (location, location2) {
    var distance_between_2points = Math.pow((location2.lng
        - location.lng), 2)
      + Math.pow((location2.lat - location.lat), 2);

    distance_between_2points = distance_between_2points < 0 ?
      distance_between_2points * (-1) : distance_between_2points;

    distance_between_2points = Math.sqrt(distance_between_2points);

    return distance_between_2points
  };

  __private.getDistanceBetween2Points = function (point_index, point_index2) {
    var distance_between_2points = Math.pow((__private.data[point_index2].lng
        - __private.data[point_index].lng), 2)
      + Math.pow((__private.data[point_index2].lat - __private.data[point_index].lat), 2);

    distance_between_2points = distance_between_2points < 0 ?
      distance_between_2points * (-1) : distance_between_2points;

    distance_between_2points = Math.sqrt(distance_between_2points);

    return distance_between_2points
  };

  __private.dijkstraSource2Point = function (source, destination_id) {
    var distance_between_source_and_connection,
      actual_index,
      index,
      nextPoints,
      next_index,
      visited_index,
      index2,
      total_value,
      actualPoints = source,
      nextActualPoints = [],
      end_search = false,
      result = [],
      points = __private.data.slice();

    console.log(points);
    console.log(source);
    console.log(destination_id);
    do {
      for (index2 = actualPoints.length-1; index2 >= 0; index2--) {

        actual_index = actualPoints[index2];
        nextPoints = points[actual_index].properties.connections.filter(__private.onlyNotVisited);

        for (index = nextPoints.length-1; index >= 0; index--) {

          next_index = nextPoints[index];
          distance_between_source_and_connection = __private.getDistanceBetween2Points(actual_index, next_index);

          if(points[actual_index].properties.is_highway) {

            if(points[next_index].properties.weight < 2) {

              points[next_index].properties.value = distance_between_source_and_connection;
              points[next_index].properties.reference = actual_index;
              points[next_index].properties.weight = 2;

            } else if(distance_between_source_and_connection < points[next_index].properties.value) {
                points[next_index].properties.value = distance_between_source_and_connection;
                points[next_index].properties.reference = actual_index;
                // weight is the same as 2 is the maximum actually
            }

          } else if (distance_between_source_and_connection < points[next_index].properties.value) {

            points[next_index].properties.value = distance_between_source_and_connection;
            points[next_index].properties.reference = actual_index;
            points[next_index].properties.weight = 1;

          }
        }

        __private.visitedPoints.push(actual_index);

        nextActualPoints = nextActualPoints.concat(nextPoints);
      }

      actualPoints = nextActualPoints.filter(__private.onlyNotVisited);
      nextActualPoints = [];

      // Check if destination was visited
      /*for(visited_index = __private.visitedPoints.length-1; visited_index >= 0; visited_index--) {
        if(__private.visitedPoints[visited_index] == destination_id) {
          end_search = true;
          break;
        }
      }*/

      // Check if all points are visited
      if(__private.visitedPoints.length == points.length || !actualPoints.length) {
        end_search = true;
      }
    } while (!end_search);

    // Get the route
    //var backtrack = [];
    actual_index = destination_id;
    while(actual_index != -1) {
        result.push(actual_index);
        actual_index = points[actual_index].properties.reference;
      //  backtrack.push(points[actual_index]);
    }
    //console.log(backtrack);
    total_value = points[destination_id].properties.value;

    __private.visitedPoints = [];

    //result.push(actual_index);

    return [result, total_value];
  };

  // -----------------------------------

  /**
   * Public Methods
   */
  __public.initialize = function() {
    __private.getData();
  };

  /**
   * source: can be lng/lat:object or structure_name:string
   * destination: can be lng/lat:object or structure_name:string
   */
  __public.getRoute = function (source, destination) {
    var sourcePoints, destinationPoints, index, actualResult, point_index,
      routeCoordinates = [],
      result = [[], Infinity];

    // Get points index
    if (typeof source == "string") {
      sourcePoints = __private.getPointsByStructureName(source);
    } else {
      sourcePoints = __private.getPointByLocation(source);
    }

    if (typeof destination == "string") {
      destinationPoints = __private.getPointsByStructureName(destination);
    } else {
      destinationPoints = __private.getPointByLocation(destination);
    }

    // Trace route
    for(index = destinationPoints.length-1; index >= 0; index--) {
      actualResult = __private.dijkstraSource2Point(sourcePoints, destinationPoints[index]);

      if(actualResult && actualResult[1] < result[1]) {
        result = actualResult;
      }
    }

    // Create geojson path
    for(index = result[0].length-1; index >= 0; index--) {

      point_index = result[0][index];

      routeCoordinates.push({ lat: __private.data[point_index].lat, lng: __private.data[point_index].lng});
    }

    return routeCoordinates;
  };

  // -----------------------------------
  return __public;

})();

