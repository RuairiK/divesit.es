'use strict';

var app = angular.module('divesitesApp');

app.controller('AddSiteController', function ($scope, uiGmapIsReady, $http, localStorageService) {

  ///////////////////////////////////////////////////////////////////////////
  // Constants
  ///////////////////////////////////////////////////////////////////////////

  // Keys for cookie storage
  var storage = {
    map: {
      LAT: 'add-site.map.center.latitude',
      LON: 'add-site.map.center.longitude',
      ZOOM: 'add-site.map.zoom'
    },
    marker: {
      LAT: 'add-site.marker.latitude',
      LON: 'add-site.marker.longitude'
    },
    NAME: 'add-site.name',
    DEPTH: 'add-site.depth',
    CATEGORY: 'add-site.category'
  };

  // Default values (should be something more sensible)
  var defaults = {
    map: {
      LAT: 53.5,
      LON: -8
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // Function definitions
  ///////////////////////////////////////////////////////////////////////////

  // Store new site data in a cookie
  $scope.storeChanges = function () {
    // Store map/center lat/lon coords and zoom in cookie
    localStorageService.set(storage.map.LAT, $scope.map.center.latitude);
    localStorageService.set(storage.map.LON, $scope.map.center.longitude);
    localStorageService.set(storage.map.ZOOM, $scope.map.zoom);
    // Store marker position
    localStorageService.set(storage.marker.LAT, $scope.marker.coords.latitude);
    localStorageService.set(storage.marker.LON, $scope.marker.coords.longitude);
    // Store other site details
    localStorageService.set(storage.NAME, $scope.site.name);
    localStorageService.set(storage.DEPTH, $scope.site.depth);
    localStorageService.set(storage.CATEGORY, $scope.site.category);
  }

  // Send site details to the server to add
  $scope.submit = function () {
    $scope.site.coords = $scope.marker.coords;
    $http.post('/divesites/', $scope.site).success(function (data ){
      // TODO: handle returned data
    });
  };

  ///////////////////////////////////////////////////////////////////////////
  // Initialize controller
  ///////////////////////////////////////////////////////////////////////////

  $scope.render = true; // tell map element to render (now that we have a size for the modal)
  $scope.map = {
    center: {
      // Initialize by centring on the stored marker, or using some 
      latitude: localStorageService.get(storage.marker.LAT) || defaults.map.LAT,
      longitude: localStorageService.get(storage.marker.LON) || defaults.map.LON
    },
    zoom: localStorageService.get(storage.map.ZOOM) || 7,
    options: {
    },
    control: {},
    events: {
      idle: function (map) {
        $scope.$apply(function () {
          $scope.storeChanges();
        });
      }
    }
  };

  $scope.markerControl = {};
  $scope.marker = {
    coords: {
      // Initial coordinates are whatever's stored, or the map's centre point
      latitude: localStorageService.get(storage.marker.LAT) || $scope.map.center.latitude,
      longitude: localStorageService.get(storage.marker.LON) || $scope.map.center.longitude
    },
    id: 0,
    options: {
      draggable: true
    },
    events: {
      dragend: function (marker, event, args) {
        $scope.map.control.refresh();
        $scope.storeChanges();
      }
    }
  };

  // Model for data binding site stuff
  $scope.site = {
    name: localStorageService.get(storage.NAME) || '',
    depth: localStorageService.get(storage.DEPTH) || null,
    category: localStorageService.get(storage.CATEGORY) || null
  }

  // Watch changes on name and depth and store them as cookies
  //$scope.$watch('site.name', $scope.storeChanges);
  //$scope.$watch('site.depth', $scope.storeChanges);

  uiGmapIsReady.promise().then(
    function (maps) {
      // Store map settings in cookie if they weren't there already
      $scope.storeChanges();
    }
  );
});
