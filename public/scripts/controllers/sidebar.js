'use strict';

var app = angular.module('divesitesApp');

app.controller('SidebarController',
  function ($scope, $rootScope, $cookieStore) {
    // Function definitions
    
    // Broadcast a filter event for the map to handle.
    // category: string containing a category that should match none or
    //           more of the db's dive sites
    // show:     boolean: true -> 'show', false -> 'hide'
    $scope.filterSites = function (category, show) {
      // Update preferences
      $cookieStore.put('filterPreferences', $scope.preferences);
      // Broadcast change event from rootscope to map
      var filterEventData = {
                              category: category, 
                              show: show,
                              depthRange: $scope.preferences.depthRange
                            } 
      $rootScope.$broadcast('event:filter-sites', filterEventData);
    };

    // Initialize controller

    console.log('initializing sidebar controller');
    // Retrieve stored filter preferences if they are in the cookie, otherwise
    // default to true for all categories
    $scope.preferences = $cookieStore.get('filterPreferences') || {
      categories:{
        wreck: true,
        scenic: true,
        drift: true
      },
      depthRange: [0, 100]
    };

    // Store preferences in the cookieStore if they didn't exist already
    $cookieStore.put('filterPreferences', $scope.preferences);
    // Fire a filter-sites event for each preference to switch visibility
    // on/off
    $scope.$on('event:map-isready', function (e) {
        console.log('received event:map-isready');
        $scope.updateAllCategories();
      }
    );

    //Slider events
    $scope.onSlide = function () {
        $scope.updateAllCategories();
    };
    $scope.formatSliderTooltip = function(value) {
      return value + "m"
    }

    // String constants for site categories --- might be useful
    $scope.WRECK = 'wreck';
    $scope.SCENIC = 'scenic';
    $scope.DRIFT = 'drift';

    //Helper function to fire a filter event for all categories
    $scope.updateAllCategories = function(){
      Object.keys($scope.preferences.categories).forEach(function (k) {
          var category = k;
          var show = $scope.preferences.categories[k];
          var filterEventData = {
                                  category: category, 
                                  show: show,
                                  depthRange: $scope.preferences.depthRange
                                }
          $rootScope.$broadcast('event:filter-sites', filterEventData);
        }
      );
    }

  }
);
