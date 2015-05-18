'use strict';

var app = angular.module('divesitesApp');
app.controller('InfoboxController', function ($scope, $http) {

  // Retrieve site comments
  $scope.retrieveComments = function () {
    var siteId = $scope.siteInfo._id;
    $http.get('/divesites/' + $scope.siteId + "/comments/")
    .success(function (data, status, headers, config) {
      $scope.site.comments = data;
    });
  };

  $scope.$on('event:site-select', function (event, data) {
    $scope.siteInfo = data.site;
    $scope.setPosition(data.pos);
    $scope.visible = true;
    console.log($scope.siteInfo);
  });

  $scope.setPosition = function (pos) {
    // TODO: pan map so that the icon is still visible even when the infobox
    // is on-screen
  };

  $scope.hide = function () {
    $scope.visible = false;
  };

  /* Initialize */
  $scope.visible = false;

});
