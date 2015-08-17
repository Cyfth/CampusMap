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
var notification;
var classNameBase = 'alert text-capitalize ';
var type;
var isShowing = false;

function showNotification(text, newType) {
  if(isShowing) {
    notification.style.display = "none";
  }

  type = newType;

  notification.style.display = "block";
  notification.className = classNameBase + type + ' animated slideInRight';

  notification.textContent = text;
  isShowing = true;
}

function hideNotification() {
  notification.className = classNameBase + type + ' animated slideOutRight';
  isShowing = false;
}

function initialize() {
  notification = document.getElementById('notification');
  notification.addEventListener('click', hideNotification, false);
}

module.exports = {
  'initialize': initialize,
  'showNotification': showNotification
}