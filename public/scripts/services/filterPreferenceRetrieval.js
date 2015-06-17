'use strict';

angular.module('divesitesApp'). factory('filterPreferenceRetrievalService', function (localStorageService) {
  var MAX_DEPTH = 100;
  return {
    validators: {
      entryType: function (value) {
        return 'true' === value ||
          true === value ||
          'false' === value ||
          false === value;
      },
      depthRange: function (value) {
        return Object.prototype.toString.call(value) == '[object Array]' &&
          value.length === 2 && value[0] >= 0 && value[1] <= MAX_DEPTH;
      },
      maximumLevel: function (value) {
          return (value - 0) === value && ('' + value).trim().length > 0;
      }
    },
    _retrieveEntryType: function (key) {
      if (localStorageService.keys().indexOf(key) > -1 &&
          this.validators.entryType(localStorage.get(key))) {
        return 'true' == localStorageService.get(key);
      }
      return true;
    },
    retrieveBoatEntry: function () {
      return this._retrieveEntryType('filterPreferences.boatEntry');
    },
    retrieveShoreEntry: function () {
      return this._retrieveEntryType('filterPreferences.shoreEntry');
    },
    depthRange: function () {
      var key = 'filterPreferences.depthRange';
      if (localStorageService.keys().indexOf(key) > -1 &&
          this.validators.depthRange(localStorage.get(key))) {
        return localStorageService.get(key);
      }
    }
  };
});
