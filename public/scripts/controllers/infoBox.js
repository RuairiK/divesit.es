'use strict';

angular.module('divesitesApp').
  controller('InfoBoxController', function ($scope, $rootScope) {

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
      visible: false
    };
    $scope.$on('event:site-loaded', $scope.siteLoadedEventHandler);
    console.log("Initializing InfoBoxController");
  };

  $scope.initialize();

});
