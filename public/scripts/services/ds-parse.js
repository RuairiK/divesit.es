'use strict';

angular.module('divesitesApp').factory('dsParse', function () {
  return {
    stringifyLevel: function (maximumLevel) {
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
  };
});
