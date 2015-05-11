'use strict';

angular.module('divesitesApp').directive('infobox', function () {
  return {
    templateUrl: 'views/partials/infobox.html',
    controller: 'MapController',
    restrict: 'E',
    link: function (scope, element, attrs) {
      console.log(scope);
    }
  };
});
