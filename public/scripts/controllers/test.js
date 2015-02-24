var app = angular.module('divesitesApp');

app.controller('TestController', function(uiGmapGoogleMapApi, $http, $scope) {

  $scope.map = { center: { latitude: 53.5, longitude: -8 }, zoom: 7 };
  // Call the API for dive sites (currently 
  $http.get('/divesites/').success(function (data) {
    $scope.map.markers = data.map(function (e) {
      return {
        id: e._id,
        location: {
          // The order of latitude and longitude is specified by GeoJSON
          longitude: e.loc.coordinates[0],
          latitude: e.loc.coordinates[1]
        },
        title: e.name,
        chart_depth: e.chart_depth
      };
    });
  });
  uiGmapGoogleMapApi.then(function(maps) {

  });
});
