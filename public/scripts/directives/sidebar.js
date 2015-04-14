'use strict';

angular.module('divesitesApp').directive('sidebar', function () {
  return {
    templateUrl: 'views/partials/sidebar.html',
    restrict: 'E',
    controller: 'SidebarController'
  };
});
