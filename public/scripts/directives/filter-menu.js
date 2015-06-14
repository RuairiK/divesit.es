'use strict';

angular.module('divesitesApp').directive('filterMenu', function () {
  return {
    templateUrl: 'views/partials/filter-menu.html',
    restrict: 'E',
    controller: 'FilterMenuController'
  }
});
