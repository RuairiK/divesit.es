angular.module('divesitesApp')
.controller('LogDiveModalController', function ($scope, $location, $auth, User, LoopBackAuth, $modalInstance, Divesite, FileUploader, $rootScope, Container) {

  $scope.site = $scope.infoBox.site;

  $scope.dive = {
    date: new Date()
  };

  $scope.datepicker = {
    formats: [
      'dd-MM-yyyy',
      'yyyy/MM/dd',
      'dd.MM.yyyy',
      'shortDate'
    ],
    open: function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.datepicker.opened = true;
    },
    options: {
      formatYear: 'yy',
      startingDay: 1
    },
    maxDate: new Date()
  };
  $scope.datepicker.format = $scope.datepicker.formats[0];

  $scope.timepicker = {
    hstep: 1,
    mstep: 1
  };

  $scope.submit = function () {
    // Copy the dive data so we don't clobber the date in the scope
    var data = JSON.parse(JSON.stringify($scope.dive));
    // Combine $scope.dive.date and $scope.dive.time into a single Date
    var date = moment(data.date);
    var time = moment(data.time);
    var combined = moment({
      y: date.year(),
      M: date.month(),
      d: date.date(),
      h: time.hour(),
      m: time.minute()
    });
    data.date = combined;
    // Delete the 'time' property
    delete data.time;
    console.log("Data to submit:");
    console.log(data);
    Divesite.dives
    .create({id: $scope.site.id}, data)
    .$promise
    .then(
      function createSuccess(res) {
        console.log("Created a dive!");
        console.log(res);
        // Broadcast an 'event:dive-created' event
        $rootScope.$broadcast('event:dive-created', res);
        // Close the modal
        $modalInstance.close();
      },
      function createError(res) {
        console.log("Failed to create a dive");
        console.log(res);
      }
    );
  };

  $scope.initialize = function () {
    console.log("init logdivemodal");
    console.log($scope);
  };
  $scope.initialize();
});
