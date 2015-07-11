'use strict';

angular.module('divesitesApp')
.filter('truncateCoordinate', function () {
  return function (coord) {
    return parseInt(coord * 1000) / 1000;
  };
});
