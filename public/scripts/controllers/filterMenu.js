'use strict';

angular.module('divesitesApp').controller('FilterMenuController', function ($scope, $rootScope, localStorageService) {

  var MAX_DEPTH = 100;

  $scope.filterEntryType = function (type, visible) {
    $scope.filterPreferences[type + 'Entry'] = visible;
    localStorageService.set('filterPreferences.' + type + 'Entry', visible);
    var data = {};
    data[type] = visible;
    $rootScope.$broadcast('event:filter-entry-type', data);
  };
  $scope.filterBoatEntry = function (visible) { $scope.filterEntryType('boat', visible); };
  $scope.filterShoreEntry = function (visible) { $scope.filterEntryType('shore', visible); };

  $scope.filterDepthRange = function (range) {
    $scope.filterPreferences.depthRange = range;
    localStorageService.set('filterPreferences.depthRange', range);
    $rootScope.$broadcast('event:filter-depth-range', {depthRange: range});
  };

  $scope.filterMinimumLevel = function (minimumLevel) {
    $scope.filterPreferences.minimumLevel = minimumLevel;
    localStorageService.set('filterPreferences.minimumLevel', minimumLevel);
    $rootScope.$broadcast('event:filter-minimum-level', {minimumLevel: minimumLevel});
  };

  /////////////////////////////////////////////////////////////////////////////
  // Initialization
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.filterPreferences = {};
    // Explicitly check each local storage value exists
    var lsKeys = localStorageService.keys();
    // Boat entry
    if (lsKeys.indexOf('filterPreferences.boatEntry') > -1) {
      // Check explicitly that it's 'true'
      $scope.filterEntryType('boat', 'true' == localStorageService.get('filterPreferences.boatEntry'));
    } else {
      $scope.filterEntryType('boat', true);
    }
    // Shore entry
    if (lsKeys.indexOf('filterPreferences.shoreEntry') > -1) {
      $scope.filterEntryType('shore', 'true' == localStorageService.get('filterPreferences.shoreEntry'));
    } else {
      $scope.filterEntryType('shore', true);
    }
    // Depth range
    if (lsKeys.indexOf('filterPreferences.depthRange') > -1) {
      var depthRange = localStorageService.get('filterPreferences.depthRange');
      $scope.filterDepthRange(depthRange);
    } else {
      $scope.filterDepthRange([0, MAX_DEPTH]);
    }
    // Minimum level
    if (lsKeys.indexOf('filterPreferences.minimumLevel') > -1) {
      var minimumLevel = localStorageService.get('filterPreferences.minimumLevel')
      $scope.filterMinimumLevel(minimumLevel);
    }
  };

  $scope.initialize();
});
