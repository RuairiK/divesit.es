'use strict';

angular.module('divesitesApp').directive('navTop', function () {
  return {
    templateUrl: 'views/partials/nav-top.html',
    restrict: 'E',
    controller: 'NavTopController'
  }
});


