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
    	this.markers = random_divesites();
    	uiGmapGoogleMapApi.then(function(maps) {

    	});
    });

    var random_divesites = function() {
    	var sites = []
    	var glatitude = 53.5
    	var glongitude = -8
    	for(var i=0;i<50;i++){
    		var site = {}
            var location = {
                latitude: glatitude + i*0.1,
                longitude: glongitude + i*0.1
            }
    		site.location = location;
    		site.id = i;
    		sites.push(site)
    	}
    	return sites;
    }

})();