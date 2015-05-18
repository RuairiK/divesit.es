'use strict';

angular.module('divesitesApp').factory('api', ['$http', function ($http) {
  return {
    retrieveDivesites: function (params) {
      return $http.get('/divesites/', {params: params});
    }
  };
}]);
