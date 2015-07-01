angular.module('divesitesApp')
.controller('ProfileCtrl', function ($scope) {
  $scope.initialize = function () {
    console.log("Initializing ProfileCtrl");
  };
  $scope.initialize();
});
