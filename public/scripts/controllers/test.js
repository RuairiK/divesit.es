var app = angular.module('divesitesApp');

app.controller('TestController', function(uiGmapGoogleMapApi, $http, $scope) {
  console.log('initializing map controller');
  $scope.map = { center: { latitude: 53.5, longitude: -8 }, zoom: 7 };
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
  $scope.options = {
    scrollwheel: true,
    disableDefaultUI: true,
    mapTypeId: 'satellite'
  };
  uiGmapGoogleMapApi.then(function(maps) {
  });
});
