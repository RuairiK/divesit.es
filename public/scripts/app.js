(function () {
  'use strict';
  var app = angular.module('divesitesApp', [
    'ngRoute', 'uiGmapgoogle-maps', 'LocalStorageModule'
  ])
  .config(function ($routeProvider, uiGmapGoogleMapApiProvider) {

    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.17',
      libraries: 'weather,geometry,visualization'
    });

    $routeProvider
    .when('/', {
      templateUrl: 'views/map.html'
      //controller: 'MapController'
    })
    .otherwise({
      redirectTo: '/'
    });
  });
})();
