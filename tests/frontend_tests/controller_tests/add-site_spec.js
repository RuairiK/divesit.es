describe('AddSiteController', function() {
	beforeEach(module('divesitesApp'));
	var scope, cookieStore, controller, httpBackend;
	beforeEach(inject(function(uiGmapIsReady, $http, $httpBackend, $cookieStore, $rootScope, $controller) {
		//set up a new scope and the controller for the test
		scope = $rootScope.$new();
		scope.site = {
			name: "testsite",
			depth: 20,
			category: "wreck"
		}
		httpBackend = $httpBackend;
		cookieStore = $cookieStore;
		controller = $controller('AddSiteController', {
			$scope: scope,
			$cookieStore: cookieStore,
		});
	}));
	describe("$scope.storeChanges", function() {
		beforeEach(function() {
			spyOn(cookieStore, 'put');
			scope.storeChanges();
		});
		it("should store map center lat/lon coords and zoom in cookie", function() {
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.map.center.latitude', 53.5);
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.map.center.longitude', -8);
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.map.zoom', 7);
		});
		it("should store marker position in a cookie", function() {
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.marker.latitude', 53.5);
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.marker.longitude', -8);
		});
		it("should store site details (name, depth, category) in a cookie", function() {
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.name', scope.site.name);
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.depth', scope.site.depth);
			expect(cookieStore.put).toHaveBeenCalledWith('add-site.category', scope.site.category);
		});
	});
	describe("$scope.submit", function() {
		it("should update $scope.site.coords", function() {
			scope.submit();
			expect(scope.site.coords).toEqual(scope.marker.coords);
		});
		it("should post site data to /divesites/", function(){
			scope.submit();
			httpBackend.expectPOST('/divesites/', scope.site).respond(201, '');
		});
	});
	describe("$scope.map.events", function() {
		it("idle handler should store changes", function(){
			spyOn(scope, 'storeChanges');
			scope.map.events.idle();
			expect(scope.storeChanges).toHaveBeenCalled();
		});
	});
	describe("$scope.marker.events", function() {
		it("dragend handler should refresh map and store changes", function(){
			spyOn(scope, 'storeChanges');
			scope.map.events.idle();
			expect(scope.storeChanges).toHaveBeenCalled();
		});
	});
});