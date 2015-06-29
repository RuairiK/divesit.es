angular.module('divesitesApp')
.controller('SignInModalCtrl', function ($scope, $location, $auth, User, LoopBackAuth, $modalInstance) {
  function authenticate(provider) {
    //console.log("authenticating with " + provider);
    $auth
    .authenticate(provider)
    .then(function (response) {
      var accessToken = response.data;
      console.log("response.data");
      console.log(response.data);
      LoopBackAuth.setUser(accessToken.id, accessToken.userId, accessToken.user);
      LoopBackAuth.rememberMe = true;
      LoopBackAuth.save();
      $modalInstance.close();
      return response.resource;
    });
  }

  function login() {
    var credentials = {
      email: $scope.email,
      password: $scope.password
    };

    User
    .login(credentials)
    .$promise
    .then(function (res) {
      $location.path('/');
    });

  }

  $scope.initialize = function () {
    console.log("Initializing sign in modal controller");
    $scope.authenticate = authenticate;
    $scope.login = login;
  };
  $scope.initialize();

});
