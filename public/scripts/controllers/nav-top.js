'use strict';

var app = angular.module('divesitesApp');

app.controller('NavTopController', function (uiGmapGoogleMapApi, $http, $scope, $rootScope, $modal, $auth, $cookieStore) {
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
    });
  };

  $scope.authenticate = function (provider) {
    $auth.authenticate(provider).then(function (response) {
      $http.get('/auth/profile').then(function (response) {
        $cookieStore.put('currentUser', response.data);
        $rootScope.currentUser = response.data;
      });
    });
  };

  $scope.logout = function () {
    $auth.logout();
    $cookieStore.remove('currentUser');
  }

  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  }

  // Initialization
  if ($cookieStore.get('currentUser')) {
    // Pull stored user details from cookie store
    $rootScope.currentUser = $cookieStore.get('currentUser');
  }

});
