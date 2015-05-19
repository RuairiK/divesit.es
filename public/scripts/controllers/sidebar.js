'use strict';

var app = angular.module('divesitesApp');

app.controller('SidebarController', function (api, $scope, $rootScope, localStorageService, $auth) {
  // Function definitions

  // Broadcast a filter event for the map to handle.
  // category: string containing a category that should match none or
  //           more of the db's dive sites
  // show:     boolean: true -> 'show', false -> 'hide'
  $scope.filterSites = function (category, show) {
    // Update preferences
    localStorageService.set('filterPreferences', $scope.preferences);
    // Broadcast change event from rootscope to map
    var filterEventData = {
      category: category, 
      show: show,
      depthRange: $scope.preferences.depthRange
    };
    // Save preferences
    localStorageService.set('filterPreferences', $scope.preferences);
    $rootScope.$broadcast('event:filter-sites', filterEventData);
  };

  // Load sites on typeahead
  $scope.loadSiteNamesAsync = function (val) {
    return api.retrieveDivesites({name: val}).then(function (response) {
      return response.data;
    });
  };
  // When the user selects a site from the search drop-down,
  // broadcast an event to tell the map to pan to the site's
  // location
  $scope.typeaheadOnSelect = function (item, model, label) {
    $rootScope.$broadcast('event:search-result-selected', item.loc);
  };

  // UI display toggles
  $scope.toggleMenu = function (menu) {
    // Switch off all other visibilities and toggle states and switch this menu on/off
    Object.keys($scope.uiVisibility).forEach(function (k) {
      if (k != menu) $scope.uiVisibility[k] = false;
      else $scope.uiVisibility[k] = !$scope.uiVisibility[k];
    });
  };

  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  }


  // Initialize controller

  // Initial GUI settings
  $scope.uiVisibility = {
    filter: false,
    search: false,
    profile: false,
    add: false
  };

  // Retrieve stored filter preferences if they are in local storage, otherwise
  // default to true for all categories
  $scope.preferences = localStorageService.get('filterPreferences') || {
    categories:{
      wreck: true,
      scenic: true,
      drift: true
    },
    depthRange: [0, 100]
  };
  // Store preferences in local storage if they didn't exist already
  localStorageService.set('filterPreferences', $scope.preferences);

  // Fire a filter-sites event for each preference to switch visibility
  // on/off
  $scope.$on('event:map-isready', function (e) {
    $scope.updateAllCategories();
  });

  // Slider events
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
  $scope.updateAllCategories = function() {
    Object.keys($scope.preferences.categories).forEach(function (k) {
      var category = k;
      var show = $scope.preferences.categories[k];
      var filterEventData = {
        category: category, 
        show: show,
        depthRange: $scope.preferences.depthRange
      }
      $rootScope.$broadcast('event:filter-sites', filterEventData);
    });
  };

});
