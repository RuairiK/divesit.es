var app = angular.module('divesitesApp');

app.controller('SidebarController',
  function (uiGmapGoogleMapApi, $http, $scope, $rootScope, $cookieStore) {

    // Initialize controller
    console.log('initializing sidebar controller');
    // Retrieve stored filter preferences if they are in the cookie
    $scope.preferences = $cookieStore.get('filterPreferences') || {
      wreck: true,
      scenic: true,
      drift: true
    };
    // Store preferences in the cookieStore if they didn't exist already
    $cookieStore.put('filterPreferences', $scope.preferences);

    // String constants for site categories
    $scope.WRECK = 'wreck';
    $scope.SCENIC = 'scenic';
    $scope.DRIFT = 'drift';

    $scope.filterSites = function (category, show) {
      // TODO: pass category (string) and show (boolean) to map
      // to switch visibility on/off
      console.log('sending filter-sites event');
      // Update preferences
      $cookieStore.put('filterPreferences', $scope.preferences);
      $rootScope.$broadcast('event:filter-sites', {category: category, show: show});
    }
  });
