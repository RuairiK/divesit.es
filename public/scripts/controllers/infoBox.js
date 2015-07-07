'use strict';

angular.module('divesitesApp').
  controller('InfoBoxController', function ($scope, $rootScope, LoopBackAuth) {

  $scope.markerClickedEventHandler = function (event, data) {
    if (!!$scope.infoBox.site) {
      $scope.infoBox.site.imgSrc = "";
    }
  };

  $scope.siteLoadedEventHandler = function (event, data) {
    $scope.showInfoBox();
    $scope.infoBox.site = data;
  };

  $scope.showInfoBox = function () {
    $scope.infoBox.visible = true;
  };

  $scope.dismissInfoBox = function () {
    $scope.infoBox.visible = false;
  };

  $scope.isOwner = function () {
    console.log("isAuthenticated? " + $scope.isAuthenticated());
    console.log("LoopBackAuth.currentUserId: " + LoopBackAuth.currentUserId);
    console.log("site:");
    console.log($scope.infoBox.site);
    return $scope.isAuthenticated() && LoopBackAuth.currentUserId == $scope.infoBox.site.userId;
  };

  /////////////////////////////////////////////////////////////////////////////
  // Listen for $rootScope events
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.infoBox = {
      visible: false,
      site: null
    };
    $scope.$on('event:site-loaded', $scope.siteLoadedEventHandler);
    $scope.$on('event:marker-clicked', $scope.markerClickedEventHandler);
  };

  $scope.initialize();

});
