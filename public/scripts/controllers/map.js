'use strict';

var app = angular.module('divesitesApp');

app.controller('MapController',
  function(uiGmapGoogleMapApi, uiGmapIsReady, $http, $scope, $rootScope, $cookieStore, $modal, $timeout) {

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
            }
          );
        }
      ).then(function () {
          $rootScope.$broadcast('event:map-isready');
        }
      );
    };
    // Initialize controller
    console.log('initializing map controller');
    // Retrieve centre and zoom values from the cookie store, if they exist
    $scope.map = {
      center: {
        latitude: ($cookieStore.get('map.center.latitude') || 53.5),
        longitude: ($cookieStore.get('map.center.longitude') || -8)
      },
      zoom: ($cookieStore.get('map.zoom') || 7)
    };

    // Needs to be non-null at initialization (for some obscure reason
    // mentioned but not explained by angular-google-maps)
    $scope.map.markers = [];

    // Object to receive marker functionality
    $scope.mapControl = {};
    $scope.markerControl = {};


    // Map options
    $scope.map.options = {
      scrollwheel: true,
      disableDefaultUI: true,
      mapTypeId: 'satellite'

    };

    // Map marker options
    $scope.map.markerOptions = { }

    // stubs for future event handling
    $scope.map.events = {
      tilesloaded: function (map) {
        $scope.$apply(function () { });
      },
      click: function (map) {
        $scope.$apply(function () { 
          });
      },
      // Prevent zoom level being too high, so as to avoid map tile 404 errors around
      // offshore dive sites.
      zoom_changed: function(map){
        var maxZoom = 14
        if(map.zoom > maxZoom){
          map.setZoom(maxZoom);
        }
      },
      // On idle, update the cookie storing the most recent map view settings
      idle: function (map) {
        $scope.$apply(function () {
            $cookieStore.put('map.zoom', map.zoom);
            // TODO: I don't know if calling map.center.[lat|lng]() is actually stable
            // or documented, but storing values from $scope.map.center leaves
            // the cookieStore out of date by exactly one drag. I think this is
            // a fault on the angular-google-maps side but I'm not sure.
            $cookieStore.put('map.center.latitude', map.center.lat());
            $cookieStore.put('map.center.longitude', map.center.lng());
          });
      }
    };

    // Map marker events 
    $scope.map.markerEvents = {
      // On click, retrieve this site's record from the sites API and do something
      // exciting with it
      click: function (marker, event, model, args) {
        $http.get('/divesites/' + model.id).success(function (data) {
            // For now, just log to the console to prove that things are
            // working.
            console.log(data);
            $scope.siteInfo = {
              name: data.name,
              coordinates: {
                longitude: data.loc[0],
                latitude: data.loc[1]
              },
              chart_depth: data.chart_depth
            }
            // Open the modal 
            $modal.open({
                templateUrl: 'views/partials/site-info.html',
                controller: 'SiteInfoController',
                // TODO: rather than send the full, scope, just give the modal
                // the site data
                scope: $scope
              });
          });
      }
    };

    $scope.$on('event:filter-sites', function (event, data) {
        console.log('received event:filter-sites');
        //console.log($scope.markerControl.getPlurals());
        $scope.map.markers.forEach(function (m) {
            if (m.category == data.category) {
              m.options.visible = data.show;
            }
          }
        );
      }
    );

    uiGmapGoogleMapApi.then(function(maps) {
      }
    );

    uiGmapIsReady.promise().then(
      // Fires when the map is loaded. Once the map is loaded, go get the
      // dive site data from the API. This means that 'event:map-isready'
      // is only called when we have *everything* we need.
      function (maps) {
        $scope.mapInstance = maps[0].map;
        $scope.retrieveDivesites();
      }
    );
  });
