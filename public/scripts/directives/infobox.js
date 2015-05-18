'use strict';

angular.module('divesitesApp').directive('infobox', function () {
  return {
    templateUrl: 'views/partials/infobox.html',
    controller: 'InfoboxController',
    restrict: 'AE',
    link: function (scope, element, attrs) {
    }
  };
});
