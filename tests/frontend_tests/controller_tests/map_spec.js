describe('MapController', function() {
	beforeEach(module('divesitesApp'));
	var scope, controller, rootScope, modal, cookieStore, httpBackend, mockData;
	beforeEach(inject(function($httpBackend, $controller, uiGmapIsReady, $http, $rootScope, $cookieStore, $modal, $timeout) {
		//set up a new scope and the controller for the test
		rootScope = $rootScope;
		scope = rootScope.$new();
		cookieStore = $cookieStore;
		modal = $modal;
		mockData = [{
			"_id": "54f5c339d65093780e3a3f14",
			"loc": [-6.05441, 53.27209],
			"name": "HMS GUIDE ME II",
			"chart_depth": 32.706,
			"category": "wreck",
			"updated_at": "2015-03-16T17:32:08.991Z"
		}, {
			"_id": "54f5d4f1506054993d9e98c6",
			"name": "Oysterhaven slip",
			"category": "scenic",
			"loc": [-8.44224214553833, 51.69350895045772],
			"chart_depth": 6,
			"__v": 0,
			"updated_at": "2015-03-03T15:36:17.899Z"
		}]
		httpBackend = $httpBackend;
		httpBackend.when("GET", "/divesites/").respond(mockData);
		httpBackend.when("GET", "/divesites/" + mockData[0]._id).respond(mockData[0]);
		controller = $controller('MapController', {
			$scope: scope,
			$rootScope: rootScope,
			$cookieStore: cookieStore,
			uiGmapIsReady: uiGmapIsReady,
			$http: $http,
			$modal: modal,
			$timeout: $timeout
		});
	}));
	describe('$scope.retrieveDivesites', function() {
		it('should populate $scope.map.markers', function() {
			scope.retrieveDivesites();
			httpBackend.flush();
			expect(scope.map.markers.length).toBe(2);
		});
		it('should broadcast a "map-isready" event', function() {
			spyOn(rootScope, '$broadcast').and.callThrough();
			scope.retrieveDivesites();
			httpBackend.flush();
			expect(rootScope.$broadcast).toHaveBeenCalledWith('event:map-isready');

		});
	});
	describe('$scope.map.events', function() {
		it('zoom_changed handler should not allow zoom level to be greater than 14', function() {
			var zoom_changed = scope.map.events.zoom_changed;
			var map = {
				zoom: 10,
				setZoom: function(newZoom) {}
			};
			spyOn(map, "setZoom");
			zoom_changed(map);
			expect(map.setZoom).not.toHaveBeenCalled();
			map.zoom = 16;
			zoom_changed(map);
			expect(map.setZoom).toHaveBeenCalledWith(14);
		});
		it('idle should store map view settings in cookie', function() {
			var idle = scope.map.events.idle;
			var map = {
				zoom: 10,
				center: {
					lat: function() {},
					lng: function() {}
				}
			}
			spyOn(map.center, 'lat').and.returnValue(53.5);
			spyOn(map.center, 'lng').and.returnValue(-8);
			spyOn(cookieStore, 'put');
			idle(map);
			expect(cookieStore.put).toHaveBeenCalledWith('map.zoom', 10);
			expect(cookieStore.put).toHaveBeenCalledWith('map.center.latitude', 53.5);
			expect(cookieStore.put).toHaveBeenCalledWith('map.center.longitude', -8);
		});
	});
	describe('$scope.map.markerEvents', function() {
		var click, model;
		beforeEach(function() {
			spyOn(modal, 'open');
			click = scope.map.markerEvents.click;
			model = {
				id: mockData[0]._id
			}
		})
		it('click should load divesite info', function() {
			click(null, null, model, null);
			httpBackend.flush();
			expect(scope.siteInfo.name).toBe(mockData[0].name);
		});
		it('click should open modal', function() {
			click(null, null, model, null);
			httpBackend.flush();
			expect(modal.open).toHaveBeenCalledWith({
				templateUrl: 'views/partials/site-info.html',
				controller: 'SiteInfoController',
				scope: scope
			});
		});
	});
	describe('on "filter-sites" event', function() {
		var isShown, filterData
		beforeEach(function() {
			scope.retrieveDivesites();
			httpBackend.flush();
			isShown = function(m) {
				return m.options.visible;
			}
			isNotShown = function(m) {
				return !m.options.visible;
			}
			filterData = {
				category: "wreck",
				show: true,
				depthRange: [0, 100]
			}

		});
		it('should show sites from a category which is set to true', function() {
			rootScope.$broadcast('event:filter-sites', filterData);
			visibleMarkers = scope.map.markers.filter(isShown);
			expect(visibleMarkers.length).toBe(1);
			expect(visibleMarkers[0].category).toBe("wreck");
		});
		it('should not show sites from a category which is set to false', function() {
			rootScope.$broadcast('event:filter-sites', filterData);
			invisibleMarkers = scope.map.markers.filter(isNotShown);
			expect(invisibleMarkers.length).toBe(1);
			expect(invisibleMarkers[0].category).toBe("scenic");
		});
		it('should not show sites whose chart_depth is outside the depth range', function(){
			filterData.depthRange = [30, 100];
			rootScope.$broadcast('event:filter-sites', filterData);
			invisibleMarkers = scope.map.markers.filter(isNotShown);
			expect(invisibleMarkers.length).toBe(1);
			expect(invisibleMarkers[0].chart_depth).toBe(6);
		});
	});
});