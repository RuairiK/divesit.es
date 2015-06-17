'use strict';

angular.module('divesitesApp').directive('infoBox', function () {
  return {
    templateUrl: 'views/partials/info-box.html',
    restrict: 'E',
    controller: 'InfoBoxController'
  }
});

