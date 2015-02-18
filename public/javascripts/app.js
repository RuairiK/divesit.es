(function(){
	var app = angular.module('divesites-app', ['uiGmapgoogle-maps']).config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})

    app.controller('testController', function(uiGmapGoogleMapApi){
    	this.map = { center: { latitude: 53.5, longitude: -8 }, zoom: 7 };
    	this.divesites = [{'name':'UC-42', 'chart_depth': 28},{'name':'U260', 'chart_depth': 34}];
    	uiGmapGoogleMapApi.then(function(maps) {

    	});
    });

})();