'use strict';

angular.module('divesitesApp').controller('FilterMenuController', function ($scope, $rootScope, localStorageService) {

  var MAX_DEPTH = 100;

  $scope.sendFilterPreferences = function () {
    $rootScope.$broadcast('event:filter-preferences', $scope.filterPreferences);
  };

  $scope.filterValidators = {
    entryType: function (value) {return 'true' == value || true === value || 'false' == value || false === value},
    depthRange: function (value) {
      return Object.prototype.toString.call(value) === '[object Array]' 
      && value.length == 2 && value[0] >= 0 && value[1] <= MAX_DEPTH
    },
    maximumLevel: function (value) {return (value - 0) == value && (''+value).trim().length > 0}
  };

  $scope.retrievers = {
    boatEntry: function (lsKeys) {
      if (lsKeys.indexOf('filterPreferences.boatEntry') > -1 &&
          $scope.filterValidators.entryType(localStorageService.get('filterPreferences.boatEntry'))) {
        return 'true' == localStorageService.get('filterPreferences.boatEntry');
      } else {
        return true;
      }
    },
    shoreEntry: function (lsKeys) {
      if (lsKeys.indexOf('filterPreferences.shoreEntry') > -1 &&
          $scope.filterValidators.entryType(localStorageService.get('filterPreferences.shoreEntry'))) {
        // Check explicitly that it's 'true'
        return 'true' == localStorageService.get('filterPreferences.shoreEntry');
      } else {
        return true;
      }
    },
    depthRange: function (lsKeys) {
      if (lsKeys.indexOf('filterPreferences.depthRange') > -1 &&
          $scope.filterValidators.depthRange(localStorageService.get('filterPreferences.depthRange'))) {
        return localStorageService.get('filterPreferences.depthRange');
      } else {
        return [0, MAX_DEPTH];
      }
    },
    maximumLevel: function (lsKeys) {
      if (lsKeys.indexOf('filterPreferences.maximumLevel') > -1 &&
          $scope.filterValidators.maximumLevel(localStorageService.get('filterPreferences.maximumLevel'))) {
        return localStorageService.get('filterPreferences.maximumLevel')
      } else {
        return 2;
      }
    }
  };

  $scope.retrieveFilterPreferences = function () {
    // Retrieve filter preferences from local storage if they're there.
    // Explicitly check each key.
    var lsKeys = localStorageService.keys();
    $scope.filterPreferences.boatEntry = $scope.retrievers.boatEntry(lsKeys);
    // Shore entry
    $scope.filterPreferences.shoreEntry = $scope.retrievers.shoreEntry(lsKeys);
    // Depth range
    $scope.filterPreferences.depthRange = $scope.retrievers.depthRange(lsKeys);
    // Minimum level
    $scope.filterPreferences.maximumLevel = $scope.retrievers.maximumLevel(lsKeys);
    // Send filter preferences
    $scope.sendFilterPreferences();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Initialization
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.filterPreferences = {};
    // Wait for divesites to load before retrieving filter preferences
    $scope.$on('event:divesites-loaded', $scope.retrieveFilterPreferences);
  };

  $scope.initialize();
});
