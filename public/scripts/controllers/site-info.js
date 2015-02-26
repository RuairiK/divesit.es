var app = angular.module('divesitesApp');

app.controller('SiteInfoController', function(uiGmapGoogleMapApi, $http, $scope, $rootScope, $cookieStore, $modal) {
  console.log('initializing site info controller');
  $scope.site = $scope.siteInfo;
});
