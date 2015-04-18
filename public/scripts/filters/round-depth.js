'use strict';

var app = angular.module('divesitesApp');

app.filter("roundDepth", function () {
    // Round to the nearest single decimal point
    return function (depth) {
      return Math.round(depth * 10) / 10;
    }
  }
);
