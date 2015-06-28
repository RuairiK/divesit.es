'use strict';

angular.module('divesitesApp').
  controller('InfoBoxController', function ($scope, $rootScope) {

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
    console.log("Initializing InfoBoxController");

    console.log("!!infoBox.site?");
    console.log(!!$scope.infoBox.site);
    console.log($scope.infoBox.site);
  };

  $scope.initialize();

});
