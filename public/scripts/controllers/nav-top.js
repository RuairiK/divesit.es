'use strict';

var app = angular.module('divesitesApp');

app.controller('NavTopController',
  function (uiGmapGoogleMapApi, $http, $scope, $modal) {
    console.log('initializing top navigation controller');
    $scope.showAbout = function () {
      $modal.open({ templateUrl: 'views/partials/about.html' });
    };
    $scope.showContact = function () {
      $modal.open({ templateUrl: 'views/partials/contact.html' });
    };
    $scope.showSubmission = function () {
      $modal.open({
          templateUrl: 'views/partials/add-site.html',
          controller: 'AddSiteController'
        }
      );
    };
  }
);
