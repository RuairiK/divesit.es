var app = angular.module('divesitesApp');

app.controller('MapController', function(uiGmapGoogleMapApi, $http, $scope, $cookieStore) {
  
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

  $scope.map.options = {
    scrollwheel: true,
    disableDefaultUI: true,
    mapTypeId: 'satellite'

  };
  // stubs for future event handling
  $scope.map.events = {
    tilesloaded: function (map) {
      $scope.$apply(function () { });
    },
    click: function (map) {
      $scope.$apply(function () { });
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
    click: function (marker, event, model, args) {
      // Retrieve this model's record from the sites API and do something
      // exciting with it
      $http.get('/divesites/' + model.id).success(function (data) {
        // For now, just log to the console to prove that things are
        // working.
        console.log(data);
        // TODO: throw up a modal with detailed information on this site
      });
    }
  };

  // Call the API for dive sites (currently returns everything)
  $http.get('/divesites/').success(function (data) {
    // On success, update the markers
    $scope.map.markers = data.map(function (e) {
      return {
        id: e._id, 
        location: {
          // The order of latitude and longitude is specified by GeoJSON
          longitude: e.loc.coordinates[0],
          latitude: e.loc.coordinates[1]
        },
        title: e.name, // the site name
        chart_depth: e.chart_depth // chart depth (at lowest astronomical tide)
      };
    });
  });

  uiGmapGoogleMapApi.then(function(maps) {
    // What are we doing here? 
  });
});
