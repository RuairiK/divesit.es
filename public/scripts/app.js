(function(){
    'use strict';

    var app = angular.module('divesitesApp',
      [
        'uiGmapgoogle-maps', 'ngCookies', 'ui.bootstrap-slider', 'ui.bootstrap', 'ngRoute'
      ]
    ).config(
      function(uiGmapGoogleMapApiProvider, $routeProvider) {
        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.17',
            libraries: 'weather,geometry,visualization'
          }
        );
        $routeProvider.when('/', {
            templateUrl: 'views/map.html'
            //controller: 'MapController'
          }
        );
      }
    );
  }
)();
