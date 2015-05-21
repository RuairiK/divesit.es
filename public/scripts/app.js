(function(){
  'use strict';

  var app = angular.module('divesitesApp', [
    'uiGmapgoogle-maps', 'ngCookies', 'ui.bootstrap', 'ngRoute', 'satellizer',
    'LocalStorageModule'
  ])
  .config(function(uiGmapGoogleMapApiProvider, $routeProvider, $authProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $authProvider.google({
      clientId: "930190391486-6pj424i3mmmvptic21rdvm2f0e9il5fl.apps.googleusercontent.com"
    });
    $authProvider.facebook({
      clientId: "1542355859342321"
    });

    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.17',
      libraries: 'weather,geometry,visualization'
    });

    $routeProvider.when('/', {
      templateUrl: 'views/map.html'
      //controller: 'MapController'
    }).when('/about', {
      templateUrl: 'views/about.html'
    }).when('/contact', {
      templateUrl:'views/contact.html'
    }).otherwise({
      redirectTo: '/'
    });
  });
})();
