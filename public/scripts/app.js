(function () {
  'use strict';
  var app = angular.module('divesitesApp', [
    'ngResource',
    'ngRoute',
    'lbServices',
    'LocalStorageModule',
    'satellizer',
    'ui.bootstrap',
    'ui.slider',
    'uiGmapgoogle-maps',
    'angularFileUpload'
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
  })
  .config(['satellizer.config', '$authProvider', function (config, $authProvider) {
    config.authHeader = 'Satellizer';
    config.httpInterceptor = false;
    $authProvider.facebook({
      clientId: '1542355859342321'
    });
    $authProvider.google({
      clientId: '930190391486-hd4l5c4uatuur1kf4foa43noibtm9r02.apps.googleusercontent.com'
    });
  }]);
})();
