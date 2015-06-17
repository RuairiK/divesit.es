'use strict';

angular.module('divesitesApp')
.filter('stringifyExperienceLevel', function () {
  return function (level) {
    var levelString;
    switch (level) {
      case 0:
        levelString = "Beginner";
        break;
      case 1:
        levelString = "Intermediate";
        break;
      default:
        levelString = "Advanced";
        break;
    }
    return levelString;
  };
});
