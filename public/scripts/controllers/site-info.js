'use strict';

var app = angular.module('divesitesApp');

app.controller('SiteInfoController', function($scope, $http, $auth) {
    $scope.isAuthenticated = $auth.isAuthenticated;
    console.log('initializing site info controller');
    $scope.site = $scope.siteInfo;
    // Retrieve comments for this dive site
    $http.get('/divesites/' + $scope.site._id + "/comments/").
        success(function (data, status, headers, config) {
        $scope.site.comments = data;
    });
    $scope.submitComment = function (text) {
        var url = '/divesites/' + $scope.site._id + '/comments/';
        console.log(url);
        var data = {
            user_id: $scope.currentUser._id,
            text: text
        };
        console.log(data);
        $http.post(url, data).
            success(function (data, status, headers, config) {
            console.log(data);
        }).
            error(function (data, status, headers, config) {
            console.log(data);
        });
    };
});
