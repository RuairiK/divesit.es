'use strict';

angular.module('divesitesApp').controller('MapController', function ($scope, $rootScope, localStorageService, $http) {

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

  function updateVisibilityOnFilter (marker) {
    var shouldBeVisible = Object.keys(marker.filterVisibility).every(function (x) {return marker.filterVisibility[x];});
    marker.options.visible = shouldBeVisible;
  }

  function filterDepthRangeEventHandler (event, data) {
    // Expects data to have key 'depthRange' with value [a, b]
    // where a and b are numeric
    function isWithinDepthRange (depth, range) {
      return depth >= range[0] && depth <= range[1];
    }
    $scope.map.markers.forEach(function (m) {
      // Determine whether this marker should be hidden because
      // the user's selected a depth range.
      m.filterVisibility.depthRange = isWithinDepthRange(m.depth, data.depthRange);
      updateVisibilityOnFilter(m);
    });
  }

  function filterEntryTypeEventHandler (event, data) {
    // Expects data to have either or both of the following keys:
    // * 'boatEntry', with value true/false
    // * 'shoreEntry', with value true/false
    $scope.map.markers.forEach(function (m) {
      Object.keys(data).forEach (function (k) {
        if (k == 'boatEntry' || k == 'shoreEntry') {
          if (m[k] && !data[k]) m.filterVisibility[k] = false;
        }
      });
      updateVisibilityOnFilter(m);
    });
  }

  function filterMinimumLevelEventHandler (event, data) {
    // Expects data to have key 'minimumLevel' with value in [0, 1, 2]
    $scope.map.markers.forEach(function (m) {
      m.filterVisibility.minimumLevel = m.minimumLevel >= data.minimumLevel;
      updateVisibilityOnFilter(m);
    });
  }

  $scope.retrieveDivesites = function () {
    $http.get('/divesites/')
    .success(function (data) {
      $scope.map.markers = data.map(function (e) {
        return {
          id: e._id,
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
          filterVisibility: {
            boatEntry: false,
            shoreEntry: false,
            depthRange: false,
            minimumLevel: false
          }
        }
      });
    }).then(function () {
      $rootScope.$broadcast('event:divesites-loaded');
    });
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
      zoom: 7,
      markers: [],
      options: {
        scrollwheel: true,
        disableDefaultUI: true,
        mapTypeId: 'roadmap'
      }
    };

    $scope.events = {
      filterDepthRange: filterDepthRangeEventHandler,
      filterEntryType: filterEntryTypeEventHandler,
      filterMinimumLevel: filterMinimumLevelEventHandler
    };

    // Listen for depth range filter changes
    $scope.$on('event:filter-depth-range', $scope.events.filterDepthRange);
    // Listen for entry type filter changes
    $scope.$on('event:filter-entry-type', $scope.events.filterEntryType);
    // Listen for maximum difficulty filter changes
    $scope.$on('event:filter-minimum-level', $scope.events.filterMinimumLevel);

    // Retrieve divesites
    $scope.retrieveDivesites();
  };

  $scope.initialize();
});
