'use strict';

angular.module('divesitesApp').controller('MapController', function ($scope, $rootScope, localStorageService, $http, uiGmapIsReady, Divesite) {

  /////////////////////////////////////////////////////////////////////////////
  // Constants
  /////////////////////////////////////////////////////////////////////////////

  var MIN_ZOOM = 3;
  var MAX_ZOOM = 14;

  /////////////////////////////////////////////////////////////////////////////
  // Function defs
  /////////////////////////////////////////////////////////////////////////////

  function mapIdleEventHandler(map) {
    // On idle, put recent map view settings into local storage
    $scope.$apply(function () {
      localStorageService.set('map.zoom', map.zoom);
      localStorageService.set('map.center.latitude', map.center.lat());
      localStorageService.set('map.center.longitude', map.center.lng());
    });
  }

  function mapZoomChangedEventHandler(map) {
    // Constrain the zoom level
    if (map.zoom > MAX_ZOOM) {
      map.setZoom(MAX_ZOOM);
    } else if (map.zoom < MIN_ZOOM) {
      map.setZoom(MIN_ZOOM);
    }
  }

  function centerChangedEventHandler(map) {
    var data = {center: {latitude: map.getCenter().lat(), longitude: map.getCenter().lng()}, zoom: map.getZoom()};
    $rootScope.$broadcast('event:center_changed', data);
  }

  function markerClickEventHandler(marker, event, model, args) {
    $rootScope.$broadcast("event:marker-clicked");
    var id = model.id;
    Divesite.findById(
      {id: id},
      function (site) {
        // XXX: for development only!
        //site.imgSrc = 'http://lorempixel.com/400/300/nature/' + (Math.floor(Math.random() * (20 - 1 + 1)) + 1);
        site.imgSrc = 'http://lorempixel.com/400/300/nature/';
        $rootScope.$broadcast("event:site-loaded", site);
      },
      function (error) {
      });
  }

  $scope.checkMinimumLevel = function (marker, data) {
    return marker.minimumLevel <= data.maximumLevel;
  };

  $scope.checkEntryTypes = function (m, data) {
    return (m.boatEntry && data.boatEntry) || (m.shoreEntry && data.shoreEntry);
  };

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
  };

  $scope.onNewSiteCreated = function (event, data) {
    console.log("map controller received new site event");
  };

  $scope.retrieveDivesites = function () {
    Divesite.find(
      {},
      function (sites) {
        $scope.map.markers = sites.map(function (e) {
          return {
            id: e.id,
            title: e.name,
            loc: {
              latitude: e.loc.lat,
              longitude: e.loc.lng
            },
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
            icon: '/img/ic_place_black_18dp.png', // Map icon URL
            filterVisibility: {
              entryType: false,
              depthRange: false,
              minimumLevel: false
            }
          }
        });
        $rootScope.$broadcast('event:divesites-loaded');
      },
      function (errorResponse) {
        console.log(errorResponse);
      }
    );
  };

  $scope.uiGmapIsReady = function (maps) {
    $rootScope.$broadcast('event:map-is-ready');
    // Issue an initial 'center-changed' event;
    $scope.map.events.center_changed(maps[0].map);
  };


  /////////////////////////////////////////////////////////////////////////////
  // Controller initialization
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.map = {
      events: {
        idle: mapIdleEventHandler,
        zoom_changed: mapZoomChangedEventHandler,
        center_changed: centerChangedEventHandler
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
        click: markerClickEventHandler // fires on marker click
      }
    };
    $scope.mapControl = {};
    $scope.markerControl = {};

    $scope.events = {
      filterPreferences: $scope.filterPreferences, // fires on 'event:filter-preferences'
      newSiteCreated: $scope.onNewSiteCreated,
      mapIsReady: $scope.retrieveDivesites // fires on 'event:map-is-ready'
    };


    // Listen for filter events
    $scope.$on('event:filter-preferences', $scope.events.filterPreferences);
    // Listen for map-ready events (to load divesites)
    $scope.$on('event:map-is-ready', $scope.events.mapIsReady);
    // Listen for new-site-created events (coming from NewSiteModalController)
    $scope.$on('event:new-site-created', $scope.events.newSiteCreated);

    uiGmapIsReady.promise().then($scope.uiGmapIsReady);
  };

  $scope.initialize();
});
