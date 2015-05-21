'use strict';

var app = angular.module('divesitesApp');

app.controller('NavTopController', function (uiGmapGoogleMapApi, localStorageService, $http, $scope, $rootScope, $modal, $auth) {

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
    // Authenticate the user
    $auth.authenticate(provider).then(function (response) {
      // Retrieve the profile
      $http.get('/auth/profile').success(function (res) {
        // Cookies seem to be broken in this v. of Angular, so let's
        // use local storage instead.
        var user = {displayName: res.displayName, picture: res.picture};
        $rootScope.currentUser = user;
        localStorageService.set('currentUser', user);
      });
    });
  };

  $scope.logout = function () {
    localStorageService.remove('currentUser');
    $auth.logout();
  }

  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  }

  // Initialization
  if (localStorageService.get('currentUser')) {
    // Pull stored user details from local storage
    $rootScope.currentUser = localStorageService.get('currentUser');
  } else if ($auth.isAuthenticated()) {
    $http.get('/auth/profile').success(function (res) {
      var user = {displayName: res.displayName, picture: res.picture};
      $rootScope.currentUser = user;
      localStorageService.set('currentUser', user);
    });
  }

});
