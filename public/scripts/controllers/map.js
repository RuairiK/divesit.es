'use strict';

angular.module('divesitesApp').controller('MapController', function ($scope, localStorageService) {

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
    if (map.zoom > MAX_ZOOM) {
      map.setZoom(MAX_ZOOM);
    } else if (map.zoom < MIN_ZOOM) {
      map.setZoom(MIN_ZOOM);
    }
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
      m.options.visible = m.options.visible && isWithinDepthRange(m.depth, data.depthRange);
    });
  }

  function filterEntryTypeEventHandler (event, data) {
    // Expects data to have keys:
    // * 'type', with value 'boat' or 'shore'
    // * 'visible', with value true/false
    $scope.map.markers.forEach(function (m) {
      if (m.entryType == data.type) {
        m.options.visible = m.options.visible && data.visible;
      }
    });
  }

  function filterMaxDifficultyEventHandler (event, data) {
    // Expects data to have key 'maxDifficulty' with value in [0, 1, 2]
    $scope.map.markers.forEach(function (m) {
      m.options.visible = m.options.visible && m.difficulty <= data.maxDifficulty;
    });
  }

  function retrieveDivesites () {
    $http.get('/divesites/')
    .success(function (data) {
      return {
        id: e._id,
        loc: e.loc,
        title: e.name,
        depth: e.depth,
        entryType: e.entryType,
        options: { // Google Maps MarkerOptions
          visible: false // initially false, switched on when filtered
        }
      }
    }).then(function () {
      $rootScope.broadcast('event:divesites-loaded');
    });;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Controller initialization
  /////////////////////////////////////////////////////////////////////////////

  $scope.map = {
    events: {
      idle: mapIdleEventHandler
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

  // Event listeners

  // Listen for depth range filter changes
  $scope.$on('event:filter-depth-range', filterDepthRangeEventHandler);
  // Listen for entry type filter changes
  $scope.$on('event:filter-entry-type', filterEntryTypeEventHandler);
  // Listen for maximum difficulty filter changes
  $scope.$on('event:filter-max-difficulty', filterMaxDifficultyEventHandler);

});
