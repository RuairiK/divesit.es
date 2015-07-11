angular.module('divesitesApp')
.controller('AddDivesiteImageModalController', function ($scope, $rootScope, $modalInstance, FileUploader, LoopBackAuth) {
  $scope.close = function () {
    $modalInstance.close();
  };

  $scope.uploader = new FileUploader({
    scope: $scope,
    url: '/api/containers/container1/upload',
    headers: {
      'Authorization': LoopBackAuth.accessTokenId
    },
    queueLimit: 1,
    onSuccessItem: function (item, response, status, headers) {
      $rootScope.$broadcast('event:divesite-image-created', item);
      $modalInstance.close();
    }
  });

  $scope.submit = function () {
    if ($scope.uploader.queue[0]) {
      $scope.uploader.queue[0].headers.divesite = res.id;
      $scope.uploader.queue[0].upload();
    }
  }
});
