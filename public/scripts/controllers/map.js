'use strict';

angular.module('divesitesApp').controller('MapController', function ($scope, $rootScope, localStorageService, $http, uiGmapIsReady) {

  /////////////////////////////////////////////////////////////////////////////
  // Constants
  /////////////////////////////////////////////////////////////////////////////

  var MIN_ZOOM = 3;
  var MAX_ZOOM = 14;

  /////////////////////////////////////////////////////////////////////////////
  // Function defs
  /////////////////////////////////////////////////////////////////////////////

  function mapIdleEventHandler (map) {
    // On idle, put recent map view settings into local storage
    $scope.$apply(function () {
      localStorageService.set('map.zoom', map.zoom);
      localStorageService.set('map.center.latitude', map.center.lat());
      localStorageService.set('map.center.longitude', map.center.lng());
    });
  }

  function mapZoomChangedEventHandler (map) {
    // Constrain the zoom level
    if (map.zoom > MAX_ZOOM) {
      map.setZoom(MAX_ZOOM);
    } else if (map.zoom < MIN_ZOOM) {
      map.setZoom(MIN_ZOOM);
    }
  }

  $scope.checkMinimumLevel = function (marker, data) {
    return marker.minimumLevel >= data.minimumLevel;
  }

  $scope.checkEntryTypes = function (m, data) {
    return (m.boatEntry && data.boatEntry) || (m.shoreEntry && data.shoreEntry);
  }

  function updateVisibilityOnFilter (marker) {
    var shouldBeVisible = Object.keys(marker.filterVisibility).every(function (x) {return marker.filterVisibility[x];});
    marker.options.visible = shouldBeVisible;
  }

  $scope.filterMarker = function (m, data) {
    function isWithinDepthRange (depth, range) {
      return depth >= range[0] && depth <= range[1];
    }
    m.filterVisibility.minimumLevel = $scope.checkMinimumLevel(m, data);
    m.filterVisibility.depthRange = isWithinDepthRange(m.depth, data.depthRange);
    m.filterVisibility.entryType = $scope.checkEntryTypes(m, data);
    updateVisibilityOnFilter(m);
  };

  $scope.filterPreferences = function (event, data) {
    $scope.map.markers.forEach(function (m) {$scope.filterMarker(m, data)});
  }

  $scope.retrieveDivesites = function () {
    $http.get('/divesites/')
    .success(function (data) {
      $scope.map.markers = data.map(function (e) {
        return {
          id: e.id,
          title: e.name,
          loc: e.loc,
          depth: e.depth,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          boatEntry: e.boatEntry,
          shoreEntry: e.shoreEntry,
          minimumLevel: e.minimumLevel,
          description: e.description,
          options: { // Google Maps MarkerOptions
            visible: false // initially false, switched on when filtered
          },
          icon: 'public/libs/material-design-icons/maps/1x_web/ic_place_black_24dp.png',
          filterVisibility: {
            entryType: false,
            depthRange: false,
            minimumLevel: false
          }
        }
      });
    }).then(function () {
      $rootScope.$broadcast('event:divesites-loaded');
    });
  }

  $scope.uiGmapIsReady = function (maps) {
    $rootScope.$broadcast('event:map-is-ready');
  }

  /////////////////////////////////////////////////////////////////////////////
  // Controller initialization
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.map = {
      events: {
        idle: mapIdleEventHandler,
        zoom_changed: mapZoomChangedEventHandler
      },
      center: {
        latitude: localStorageService.get('map.center.latitude') || 53.5,
        longitude: localStorageService.get('map.center.longitude') || -8
      },
      zoom: localStorageService.get('map.zoom') || 7,
      markers: [],
      options: {
        scrollwheel: true,
        disableDefaultUI: true,
        mapTypeId: 'roadmap'
      },
      markerEvents: {
        click: function (marker, event, model, args) {
          console.log(model.shoreEntry);
        }
      }
    };
    $scope.mapControl = {};
    $scope.markerControl = {};

    $scope.events = {
      filterPreferences: $scope.filterPreferences,
      mapIsReady: $scope.retrieveDivesites
    };


    // Listen for filter events
    $scope.$on('event:filter-preferences', $scope.events.filterPreferences);
    // Listen for depth range filter changes
    //$scope.$on('event:filter-depth-range', $scope.events.filterDepthRange);
    // Listen for entry type filter changes
    //$scope.$on('event:filter-entry-type', $scope.events.filterEntryType);
    // Listen for maximum difficulty filter changes
    //$scope.$on('event:filter-minimum-level', $scope.events.filterMinimumLevel);
    // Listen for map-ready events (to load divesites)
    $scope.$on('event:map-is-ready', $scope.events.mapIsReady);

    uiGmapIsReady.promise().then($scope.uiGmapIsReady);
  };

  $scope.initialize();
});
