angular.module('divesitesApp')
.controller('EditSiteModalController', function ($scope, $location, $auth, User, LoopBackAuth, $modalInstance, Divesite, uiGmapIsReady, FileUploader, $rootScope, Container) {
  //console.log($scope);
  $scope.rendered = false;
  $scope.site = $scope.infoBox.site;

  console.log($scope.site);

  if ($scope.site.images && $scope.site.images[0]) {
    // TODO: load the thumbnail, then let the user delete the image if they
    // want to and add a replacement
  }

  $scope.uploader = new FileUploader({
    scope: $scope,
    url: '/api/containers/container1/upload',
    headers: {
      'Authorization': LoopBackAuth.accessTokenId
    },
    queueLimit: 1,
    onAfterAddingFile: function (fileItem) {
      console.info('onAfterAddingFile');
    }
  });

  $scope.map = {
    center: {
      latitude: $scope.site.loc.lat,
      longitude: $scope.site.loc.lng
    },
    zoom: 14,
    events: {
      idle: function (map) {
        $scope.$apply();
        if (!$scope.rendered) {
          $scope.rendered = true;
          google.maps.event.trigger(map, 'resize');
          $scope.map.center = {
            latitude: $scope.site.loc.lat,
            longitude: $scope.site.loc.lng
          };
          $scope.map.zoom = 14;
          $('<div/>').addClass('centreMarker').appendTo(map.getDiv());
        }
      }
    }
  };

  $scope.submit = function () {
    $scope.site.loc = {
      lat: Number($scope.map.center.latitude),
      lng: Number($scope.map.center.longitude)
    };
    $scope.site
    .$save()
    .then(
      // Handle success
      function editSuccess(res) {
        // Close the modal and broadcast a site-edited event
        $modalInstance.close();
        $rootScope.$broadcast('event:site-edited', res);
      },
      // Handle failure
      function editError(res) {
        console.log("Failed to update the site");
      }
    )
  };

  $scope.close = function () {
    $modalInstance.close();
  }
});
