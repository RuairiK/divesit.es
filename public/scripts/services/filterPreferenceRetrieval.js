'use strict';

angular.module('divesitesApp'). factory('filterPreferenceRetrievalService', function (localStorageService) {
  var MAX_DEPTH = 100;
  var self = this;

  // Generic entry-type retriever
  var _retrieveEntryType = function (key) {
    if (localStorageService.keys().indexOf(key) > -1 &&
        validators.entryType(localStorageService.get(key))) {
      return 'true' == localStorageService.get(key);
    }
    return true;
  };

  // Validator functions for each preference type
  var validators = {
    // Ensure that a stored entry type is a boolean or boolean-ish value
    entryType: function (value) {
      return 'true' === value ||
        true === value ||
        'false' === value ||
        false === value;
    },
    // Ensure that a stored depth range is an array of length 2 where
    // range[0] >= 0 (i.e., at or below the surface) and
    // range[1] <= 100 (i.e., at or above our arbitrary maximum depth)
    depthRange: function (value) {
      return Object.prototype.toString.call(value) == '[object Array]' &&
        value.length === 2 && value[0] >= 0 && value[1] <= MAX_DEPTH;
    },
    maximumLevel: function (value) {
      return (value - 0) === value && ('' + value).trim().length > 0;
    }
  };

  return {
    validators: validators,
    // Retrieve stored filter preference for boat entry
    boatEntry: function () {
      return _retrieveEntryType('filterPreferences.boatEntry');
    },
    // Retrieve stored filter preference for shore entry
    shoreEntry: function () {
      return _retrieveEntryType('filterPreferences.shoreEntry');
    },
    // Retrieve stored filter preference for depth range
    depthRange: function () {
      var key = 'filterPreferences.depthRange';
      if (localStorageService.keys().indexOf(key) > -1 &&
          validators.depthRange(localStorageService.get(key))) {
        return localStorageService.get(key);
      }
      return [0, MAX_DEPTH];
    },
    // Retrieve stored filter preference for maximum experience level
    maximumLevel: function () {
      var key = 'filterPreferences.maximumLevel';
      if (localStorageService.keys().indexOf(key) > -1 &&
          validators.maximumLevel(localStorageService.get(key))) {
        return localStorageService.get(key);
      }
      return 2;
    }
  };
});
