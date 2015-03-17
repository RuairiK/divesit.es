var app = angular.module('divesitesApp');

app.controller('SiteInfoController', function($scope) {
  console.log('initializing site info controller');
  $scope.site = $scope.siteInfo;
});
