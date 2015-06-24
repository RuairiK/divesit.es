'use strict';

angular.module('divesitesApp').
  controller('InfoBoxController', function ($scope, $rootScope) {

  $scope.markerClickedEventHandler = function (event, data) {
    $scope.infoBox.site.imgSrc = "";
  };

  $scope.siteLoadedEventHandler = function (event, data) {
    $scope.infoBox.visible = true;
    console.log(data);
    $scope.infoBox.site = data;
  };

  $scope.dismissInfoBox = function () {
    $scope.infoBox.visible = false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Listen for $rootScope events
  /////////////////////////////////////////////////////////////////////////////

  $scope.initialize = function () {
    $scope.infoBox = {
      visible: false,
      site: {}
    };
    $scope.$on('event:site-loaded', $scope.siteLoadedEventHandler);
    $scope.$on('event:marker-clicked', $scope.markerClickedEventHandler);
    console.log("Initializing InfoBoxController");
  };

  $scope.initialize();

});
