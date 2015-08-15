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
/*
MIT License

Copyright (c) 2013 Benjamin Becquet

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Leaflet = require('Leaflet');

function radians(degrees) {
  return degrees * (Math.PI / 180);
}
function degrees(radians) {
  return radians * (180 / Math.PI);
}

Leaflet.RotatedMarker = Leaflet.Marker.extend({
    'options': {
        angle: 0
    },

    '_setPos': function (position) {
      Leaflet.Marker.prototype._setPos.call(this, position);

      if (Leaflet.DomUtil.TRANSFORM) {
          // use the CSS transform rule if available
          this._icon.style[Leaflet.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
      } else if(Leaflet.Browser.ie) {
          // fallback for IE6, IE7, IE8
          var rad = this.options.angle * (Math.PI / 180),
              costheta = Math.cos(rad),
              sintheta = Math.sin(rad);
          this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
              costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
      }

      return this;
    },
    'setAngle': function (angle) {

      this.options.angle = angle;
      this._setPos(this._latlng);

      return this;
    },
    // Source: http://gis.stackexchange.com/questions/29239/calculate-bearing-between-two-decimal-gps-coordinates
    'bearTo': function (newPosition) {
      var lastPosition = Object.create(this._latlng);
      lastPosition.lat = radians(lastPosition.lat);
      lastPosition.lng = radians(lastPosition.lng);
      newPosition.lat = radians(newPosition.lat);
      newPosition.lng = radians(newPosition.lng);

      var deltaLongitude = newPosition.lng - lastPosition.lng;

      var deltaLatitude = Math.log(Math.tan(newPosition.lat/2.0+Math.PI/4.0)/Math.tan(lastPosition.lat/2.0+Math.PI/4.0));
      if (Math.abs(deltaLongitude) > Math.PI){
        if (deltaLongitude > 0.0)
          deltaLongitude = -(2.0 * Math.PI - deltaLongitude);
        else
          deltaLongitude = (2.0 * Math.PI + deltaLongitude);
      }

      var newAngle = (degrees(Math.atan2(deltaLongitude, deltaLatitude)) + 360.0) % 360.0;
      this.setAngle(newAngle);

      return this;
    }
});

function create(position, options) {
  return new Leaflet.RotatedMarker(position, options);
}

module.exports = {
  'create': create
}