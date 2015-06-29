'use strict';

angular.module('divesitesApp')
.controller('NavTopController', function ($scope, $modal, $auth, User, LoopBackAuth, $location) {
  function summonModal() {
    console.log("summoning modal");
    $modal.open({
      animation: false,
      templateUrl: 'views/partials/sign-in-modal.html',
      controller: 'SignInModalCtrl',
      size: 'sm'
    });
  }

  function isAuthenticated() {
    return User.isAuthenticated();
  }

  function logout() {
    console.log("logging out");
    User
    .logout()
    .$promise
    .then(function (res) {
      LoopBackAuth.clearUser();
      LoopBackAuth.save();
      $location.path('/');
    })
    .catch(function (err) {
      LoopBackAuth.clearUser();
      LoopBackAuth.save();
      localStorage.clear();
      $location.path('/');
    });
  }


  $scope.initialize = function () {
    $scope.summonModal = summonModal;
    $scope.isAuthenticated = isAuthenticated;
    $scope.logout = logout;
  }
  $scope.initialize();

});
