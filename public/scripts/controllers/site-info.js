'use strict';

var app = angular.module('divesitesApp');

app.controller('SiteInfoController', function($scope, $http, $auth) {
  $scope.isAuthenticated = $auth.isAuthenticated;
  $scope.site = $scope.siteInfo;
  // Retrieve comments for this dive site
  $http.get('/divesites/' + $scope.site._id + "/comments/").
    success(function (data, status, headers, config) {
    $scope.site.comments = data;
  });
  $scope.submitComment = function (text) {
    var url = '/divesites/' + $scope.site._id + '/comments/';
    var data = {
      user_id: $scope.currentUser._id,
      text: text
    };
    $http.post(url, data).
      success(function (data, status, headers, config) {
      // TODO: handle successful comment submission
    }).
      error(function (data, status, headers, config) {
      // TODO: handle unsuccessful comment submission
    });
  };
});
