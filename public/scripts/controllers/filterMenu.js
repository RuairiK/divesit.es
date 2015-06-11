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
    minimumLevel: function (value) {return (value - 0) == value && (''+value).trim().length > 0}
  };

  $scope.retrieveFilterPreferences = function () {
    // Retrieve filter preferences from local storage if they're there.
    // Explicitly check each key.
    var lsKeys = localStorageService.keys();
    if (lsKeys.indexOf('filterPreferences.boatEntry') > -1 &&
        $scope.filterValidators.entryType(localStorageService.get('filterPreferences.boatEntry'))) {
      $scope.filterPreferences.boatEntry = 'true' == localStorageService.get('filterPreferences.boatEntry');
    } else {
      $scope.filterPreferences.boatEntry = true;
    }
    // Shore entry
    if (lsKeys.indexOf('filterPreferences.shoreEntry') > -1 &&
       $scope.filterValidators.entryType(localStorageService.get('filterPreferences.shoreEntry'))) {
      // Check explicitly that it's 'true'
      $scope.filterPreferences.shoreEntry = 'true' == localStorageService.get('filterPreferences.shoreEntry');
    } else {
      $scope.filterPreferences.shoreEntry = true;
    }
    // Depth range
    if (lsKeys.indexOf('filterPreferences.depthRange') > -1 &&
       $scope.filterValidators.depthRange(localStorageService.get('filterPreferences.depthRange'))) {
      var depthRange = localStorageService.get('filterPreferences.depthRange');
      $scope.filterPreferences.depthRange = depthRange;
    } else {
      $scope.filterPreferences.depthRange = [0, MAX_DEPTH]
    }
    // Minimum level
    if (lsKeys.indexOf('filterPreferences.minimumLevel') > -1 &&
       $scope.filterValidators.minimumLevel(localStorageService.get('filterPreferences.minimumLevel'))) {
      var minimumLevel = localStorageService.get('filterPreferences.minimumLevel')
      $scope.filterPreferences.minimumLevel = minimumLevel;
    } else {
      $scope.filterPreferences.minimumLevel = 0;
    }
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
