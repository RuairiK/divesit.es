describe('SiteInfoController', function() {
	beforeEach(module('divesitesApp'));
	var scope, controller;
	beforeEach(inject(function($rootScope, $controller) {
		//set up a new scope and the controller for the test
		scope = $rootScope.$new();
		scope.siteInfo = {
			name: "Test site",
			coordinates: {
				longitude: 53.5,
				latitude: -8
			},
			chart_depth: 30
		}
		controller = $controller('SiteInfoController', {
			$scope: scope
		});
	}));
	describe('$scope.siteInfo', function() {
		it('should contain the same as $scope.site', function() {
			expect(scope.site).toEqual(scope.siteInfo);
		});
	});
});