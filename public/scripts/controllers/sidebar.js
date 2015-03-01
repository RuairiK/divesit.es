var app = angular.module('divesitesApp');

app.controller('SidebarController',
  function (uiGmapGoogleMapApi, $http, $scope, $rootScope, $cookieStore) {

    // Function definitions
    
    // Broadcast a filter event for the map to handle.
    // category: string containing a category that should match none or
    //           more of the db's dive sites
    // show:     boolean: true -> 'show', false -> 'hide'
    $scope.filterSites = function (category, show) {
      // Update preferences
      $cookieStore.put('filterPreferences', $scope.preferences);
      // Broadcast change event from rootscope to map
      $rootScope.$broadcast('event:filter-sites', {category: category, show: show});
    };

    // Initialize controller

    console.log('initializing sidebar controller');
    // Retrieve stored filter preferences if they are in the cookie, otherwise
    // default to true for all categories
    $scope.preferences = $cookieStore.get('filterPreferences') || {
      wreck: true,
      scenic: true,
      drift: true
    };

    // Store preferences in the cookieStore if they didn't exist already
    $cookieStore.put('filterPreferences', $scope.preferences);
    // Fire a filter-sites event for each preference to switch visibility
    // on/off
    $scope.$on('event:map-isready', function (e) {
        console.log('received event:map-isready');
        Object.keys($scope.preferences).forEach(function (k) {
            var category = k;
            var show = $scope.preferences[k];
            $rootScope.$broadcast('event:filter-sites', {category: category, show: show});
          }
        );
      }
    );

    // String constants for site categories --- might be useful
    $scope.WRECK = 'wreck';
    $scope.SCENIC = 'scenic';
    $scope.DRIFT = 'drift';

  }
);
