(function(){
  var app = angular.module('divesitesApp', ['uiGmapgoogle-maps', 'ngCookies']).config(
    function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
      });
    })
})();
