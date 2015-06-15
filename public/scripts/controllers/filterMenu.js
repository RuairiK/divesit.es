'use strict';

angular.module('divesitesApp').controller('FilterMenuController', function ($scope, $rootScope, localStorageService) {

  var MAX_DEPTH = 100;

  $scope.storeFilterPreferences = function () {
    localStorageService.set('filterPreferences.boatEntry', $scope.filterPreferences.boatEntry);
    localStorageService.set('filterPreferences.shoreEntry', $scope.filterPreferences.shoreEntry);
    localStorageService.set('filterPreferences.depthRange', $scope.filterPreferences.depthRange);
    localStorageService.set('filterPreferences.maximumLevel', $scope.filterPreferences.maximumLevel);
  };

  $scope.updateAndSendFilterPreferences = function () {
    $scope.storeFilterPreferences();
    $rootScope.$broadcast('event:filter-preferences', $scope.filterPreferences);
  };

  $scope.stringifyMaximumLevel = function (maximumLevel) {
    var levelString;
    switch (maximumLevel) {
      case 0:
        levelString = "Beginner";
        break;
      case 1:
        levelString = "Intermediate";
        break;
      default:
        levelString = "Advanced";
    }
    return levelString;
  }

  $scope.filterValidators = {
    entryType: function (value) {return 'true' == value || true === value || 'false' == value || false === value},
    depthRange: function (value) {
      return Object.prototype.toString.call(value) === '[object Array]' &&
        value.length == 2 && value[0] >= 0 && value[1] <= MAX_DEPTH
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
  };

  // Slider options
  function prependSliderTrack(event, ui) {
    // Add a visible slider track. We can't do this in the markup
    // because ui-slider is creating the node for us
    console.log(event.target.id);
    $(event.target).prepend("<div class='ui-slider-track'></div>");
    $(event.target).prepend("<div class='ui-slider-track-on'></div>");
  }
  $scope.maximumLevelSlider = {
    create: prependSliderTrack,
    change: function (event, ui) {
      var width = $(event.target).children('.ui-slider-handle').css('left');
      $(event.target).children('.ui-slider-track-on').css({'width': width});
      //console.log($(event.target).css());
    }
  };
  $scope.depthRangeSlider = {
    range: true,
    create: prependSliderTrack
  }

  /////////////////////////////////////////////////////////////////////////////
  // Initialization
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.filterPreferences = {};
    $scope.retrieveFilterPreferences();
    // Wait for divesites to load before retrieving filter preferences
    $scope.$on('event:divesites-loaded', $scope.updateAndSendFilterPreferences);
  };

  $scope.initialize();
});
