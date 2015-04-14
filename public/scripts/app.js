(function(){
  'use strict';

<<<<<<< HEAD
  var app = angular.module('divesitesApp', [
    'uiGmapgoogle-maps', 'ngCookies', 'ui.bootstrap', 'ngRoute', 'satellizer'
  ])
  .config(function(uiGmapGoogleMapApiProvider, $routeProvider, $authProvider) {


    $authProvider.google({
      clientId: "930190391486-6pj424i3mmmvptic21rdvm2f0e9il5fl.apps.googleusercontent.com"
    });

    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.17',
      libraries: 'weather,geometry,visualization'
    });

    $routeProvider.when('/', {
      templateUrl: 'views/map.html'
      //controller: 'MapController'
    });
  });
})();
