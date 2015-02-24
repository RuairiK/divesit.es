var app = angular.module('divesitesApp');

app.controller('MapController', function(uiGmapGoogleMapApi, $http, $scope) {
  // Initialize controller
  console.log('initializing map controller');
  $scope.map = { center: { latitude: 53.5, longitude: -8 }, zoom: 7 };
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
    }
  };
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
