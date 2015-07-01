angular.module('divesitesApp')
.controller('NewSiteModalController', function ($scope, $location, $auth, User, LoopBackAuth, $modalInstance, Divesite, uiGmapIsReady) {
  $scope.rendered = false;
  $scope.map = {
    center: {
      latitude: 51.687445952756164,
      longitude: -8.456608963012737
    },
    zoom: 14,
    events: {
      idle: function (map) {
        // This is a hack to get around the fact that the map is initialized before the modal is ready.
        // This causes the tiles to be wonky. See:
        // https://github.com/angular-ui/angular-google-maps/issues/147
        // There's probably a solution with ng-if but I can't get it to work.
        google.maps.event.trigger(map, 'resize');
        $scope.$apply();
        if (!$scope.rendered) {
          // After the first time we resize to fit the map into the modal div,
          // we need to re-centre it.
          $scope.map.center.latitude = 51.687445952756164;
          $scope.map.center.longitude = -8.456608963012737;
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
    Divesite
    .create($scope.newSite)
    .$promise
    .then(function (res) {
      console.log(res);
      $modalInstance.close();
    })
  }

  $scope.mapControl = {};

  $scope.uiGmapIsReady = function (maps) {
  };

  uiGmapIsReady.promise().then($scope.uiGmapIsReady);
});
