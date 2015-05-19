'use strict';

var app = angular.module('divesitesApp');

app.controller('MapController', function(uiGmapIsReady, $http, $scope, $rootScope, localStorageService, $timeout) {

  var overlay;
  var getPixelPosition = function (marker) {
    var projection = overlay.getProjection();
    var pixel = projection.fromLatLngToContainerPixel(marker.getPosition());
    return pixel;
  }

  $scope.retrieveDivesites = function () {
    // Call the API for dive sites (currently returns everything)
    $http.get('/divesites/').success(function (data) {
      // On success, update the markers
      $scope.map.markers = data.map(function (e) {
        return {
          id: e._id, 
          location: {
            // The order of latitude and longitude is specified by GeoJSON.
            // It's the opposite way around from how GPS coordinates are normally
            // presented, so we need to be aware of this going forward.
            longitude: e.loc[0],
            latitude: e.loc[1]
          },
          title: e.name, // the site name
          chart_depth: e.chart_depth, // chart depth (at lowest astronomical tide)
          options: { // Google Maps MarkerOptions
            visible: false // initially false, switched on when we know preferences
          },
          category: e.category, // site category ('wreck', 'scenic', etc.)
          icon: '/img/icons/' + e.category + '.png'
        };
      });
    }).then(function () {
      // When we've retrieved the dive sites, notify listeners
      $rootScope.$broadcast('event:map-isready');
    });
  }

  // Hide the info window
  $scope.dismiss = function () {
    $('#infobox').css({display: 'none'});
  }

  // Initialize controller

  // Retrieve centre and zoom values from local storage, if they exist
  $scope.map = {
    center: {
      latitude: (localStorageService.get('map.center.latitude') || 53.5),
      longitude: (localStorageService.get('map.center.longitude') || -8)
    },
    zoom: (localStorageService.get('map.zoom') || 7)
  };

  // Needs to be non-null at initialization (for some obscure reason
  // mentioned, but not explained, in the angular-google-maps source)
  $scope.map.markers = [];

  // Object to receive marker functionality
  $scope.mapControl = {};
  $scope.markerControl = {};

  // Map options
  $scope.map.options = {
    scrollwheel: true,
    disableDefaultUI: true,
    mapTypeId: 'roadmap'
  };

  // Map marker options
  $scope.map.markerOptions = { };

  //$scope.siteInfo = { name: "Hello world" };
  $scope.siteInfo = {};

  // Handle map events
  $scope.map.events = {
    // Prevent zoom level being too high, so as to avoid map tile 404 errors around
    // offshore dive sites.
    zoom_changed: function(map) {
      var maxZoom = 14
      if(map.zoom > maxZoom){
        map.setZoom(maxZoom);
      }
    },
    // On idle, update the local storage storing the most recent map view settings
    idle: function (map) {
      $scope.$apply(function () {
        localStorageService.set('map.zoom', map.zoom);
        // TODO: I don't know if calling map.center.[lat|lng]() is actually stable
        // or documented, but storing values from $scope.map.center leaves
        // the local storage out of date by exactly one drag. I think this is
        // a fault on the angular-google-maps side but I'm not sure.
        localStorageService.set('map.center.latitude', map.center.lat());
        localStorageService.set('map.center.longitude', map.center.lng());
      });
    }
  };

  // Map marker events 
  $scope.map.markerEvents = {
    // On click, retrieve this site's record from the sites API and do something
    // exciting with it
    mouseover: function (marker, event, model, args) {
    },
    mouseout: function (marker, event, model, args) {
    },
    click: function (marker, event, model, args) {
      $http.get('/divesites/' + model.id).success(function (data) {
        // Pull the data we want from the returned JSON
        $scope.siteInfo = {
          "_id": data._id,
          name: data.name,
          coordinates: {
            longitude: data.loc[0],
            latitude: data.loc[1]
          },
          chart_depth: data.chart_depth
        };
        // Get the mouse click event position
        var pixel = getPixelPosition(marker);
        // Send it to listening scopes
        $rootScope.$broadcast('event:site-select', {pos: pixel, site: $scope.siteInfo}); // broadcast event to all scopes
      });
    }
  };

  $scope.$on('event:filter-sites', function (event, data) {
    $scope.map.markers.forEach(function (m) {
      if (isWithinDepthRange(m.chart_depth, data.depthRange)) {
        if (m.category == data.category) {
          m.options.visible = data.show;
        }
      } else {
        m.options.visible = false;
      }
    });
  });

  $scope.$on('event:search-result-selected', function (event, data) {
    console.log(data);
    $scope.mapInstance.panTo({lat: data[1], lng: data[0]});
  });

  var isWithinDepthRange = function(depth, range){
    return depth >= range[0] && depth <= range[1]
  }

  uiGmapIsReady.promise().then(function (maps) {
    // Fires when the map is loaded. Once the map is loaded, go get the
    // dive site data from the API. This means that 'event:map-isready'
    // is only called when we have *everything* we need.
    $scope.mapInstance = maps[0].map;
    // Single InfoWindow
    $scope.infoWindow = new google.maps.InfoWindow();
    $scope.retrieveDivesites();
    // overlay for mouse cursor
    overlay = new google.maps.OverlayView();
    overlay.draw = function () {};
    overlay.setMap($scope.mapInstance);
  });
});
