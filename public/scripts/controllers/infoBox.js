'use strict';

angular.module('divesitesApp').
  controller('InfoBoxController', function ($scope, $rootScope, LoopBackAuth, $modal) {

  $scope.markerClickedEventHandler = function (event, data) {
    if (!!$scope.infoBox.site) {
      $scope.infoBox.site.imgSrc = null;
    }
  };

  $scope.siteLoadedEventHandler = function (event, data) {
    $scope.showInfoBox();
    $scope.infoBox.site = data;
    if ($scope.infoBox.dives) {
      var numDives = $scope.infoBox.site.dives.length;
      $scope.infoBox.site.numDivesString = numDives + " dive" + (numDives === 1 ? "" : "s");
      console.log(numDives);
      console.log($scope.infoBox.site.numDivesString);
    }
  };

  $scope.showInfoBox = function () {
    $scope.infoBox.visible = true;
  };

  $scope.dismissInfoBox = function () {
    $scope.infoBox.visible = false;
  };

  $scope.isOwner = function () {
    return $scope.isAuthenticated() && LoopBackAuth.currentUserId == $scope.infoBox.site.userId;
  };

  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  $scope.events = {
    // Handle a newly-logged dive
    diveCreated: function (event, data) {
      console.log($scope.infoBox.site.id);
      if ($scope.infoBox.site && data.siteId === $scope.infoBox.site.id) {
        // The dive has been logged for the site that the info box is
        // currently showing. This should *usually* be the case, since
        // the link to log a dive comes from the info box.
        // 
        // TODO: re-load the dive site info
      }
    }
  };

  $scope.summonEditSiteModal = function () {
    $modal.open({
      animation: false,
      templateUrl: 'views/partials/edit-site-modal.html',
      controller: 'EditSiteModalController',
      backdrop: 'static',
      size: 'lg',
      scope: $scope
    });
  };

  $scope.summonLogDiveModal = function () {
    $modal.open({
      animation: false,
      templateUrl: 'views/partials/log-dive-modal.html',
      controller: 'LogDiveModalController',
      backdrop: 'static',
      size: 'lg',
      scope: $scope
    });
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
    $scope.$on('event:dive-created', $scope.events.diveCreated);
  };

  $scope.initialize();

});
