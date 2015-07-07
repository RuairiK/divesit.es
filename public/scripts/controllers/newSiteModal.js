angular.module('divesitesApp')
.controller('NewSiteModalController', function ($scope, $location, $auth, User, LoopBackAuth, $modalInstance, Divesite, uiGmapIsReady, FileUploader) {

  // This is a first-run flag so that we can resize the Google map after the
  // div containing it has loaded.
  $scope.rendered = false;

  $scope.uploader = new FileUploader({
    scope: $scope,
    url: '/api/containers/container1/upload',
    formData: [
      {key: 'value'}
    ]
  });

  $scope.map = {
    center: $scope.$parent.map.center,
    zoom: $scope.$parent.map.zoom,
    events: {
      idle: function (map) {
        // This is a hack to get around the fact that the map is initialized before the modal is ready.
        // This causes the tiles to be wonky. See:
        // https://github.com/angular-ui/angular-google-maps/issues/147
        // There's probably a solution with ng-if but I can't get it to work.
        $scope.$apply();
        if (!$scope.rendered) {
          google.maps.event.trigger(map, 'resize');
          // After the first time we resize to fit the map into the modal div,
          // we need to re-centre it.
          //$scope.map.center.latitude = 51.687445952756164;
          //$scope.map.center.longitude = -8.456608963012737;
          $scope.map.center = $scope.$parent.map.center;
          $scope.map.zoom = $scope.$parent.map.zoom;
          $scope.rendered = true;
          // Create a fake centre marker
          $('<div/>').addClass('centreMarker').appendTo(map.getDiv());
        }
      },
      tilesloaded: function (map) {
      },
      zoom: function (map) {
        //google.maps.event.trigger(map, 'resize');
      }
    }
  };

  $scope.newSite = {
    loc: $scope.map.center,
    boatEntry: false,
    shoreEntry: false,
    minimumLevel: 2,
    depth: 10,
    description: "A decent training site but not much to see."
  }

  $scope.close = function () {
    //if (confirm("Are you sure you want to discard this new site?")) $modalInstance.close();
    $modalInstance.close();
  }

  $scope.submit = function () {
    console.log("Data to send:");
    // Re-format the loc property so that LoopBack will understand it as a geopoint
    $scope.newSite.loc = {
      lat: Number($scope.map.center.latitude),
      lng: Number($scope.map.center.longitude)
    }
    console.log($scope.newSite);
    // FIXME: commenting out to test form validation
    /*
    Divesite
    .create($scope.newSite)
    .$promise
    .then(function (res) {
      console.log(res);
      $modalInstance.close();
    });
   */
  }

  $scope.mapControl = {};

  $scope.uiGmapIsReady = function (maps) {
  };

  uiGmapIsReady.promise().then($scope.uiGmapIsReady);
});
