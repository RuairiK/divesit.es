describe "MapController", () ->
  beforeEach () -> module 'divesitesApp'
  $scope = {}
  $rootScope = {}
  $httpBackend = {}
  localStorageService = {}
  beforeEach inject (_$rootScope_, _$controller_, _$httpBackend_, _localStorageService_) ->
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()
    localStorageService = _localStorageService_
    mockData = [
      {
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
      }
    ]
    $httpBackend = _$httpBackend_
    $httpBackend.when "GET", "/divesites/"
      .respond mockData
    $httpBackend.when "GET", "/divesites/" + mockData[0]._id
      .respond mockData[0]
    $controller = _$controller_ 'MapController', {
      $scope: $scope
      $rootScope: $rootScope
      localStorageService: localStorageService
    }

  describe "$scope.retrieveDivesites", () ->
    it "populates $scope.map.markers", () ->
      $scope.retrieveDivesites()
      $httpBackend.flush()
      expect $scope.map.markers.length
        .toBe 2
    it "broadcasts a 'map-isready' event", () ->
      spyOn $rootScope, '$broadcast'
        .and.callThrough()
      $scope.retrieveDivesites()
      $httpBackend.flush()
      expect $rootScope.$broadcast
        .toHaveBeenCalledWith 'event:map-isready'
  describe "$scope.map.events", () ->
    it "zoom_changed handler does not allow zoom level greater than 14", () ->
      zoom_changed = $scope.map.events.zoom_changed
      map = 
        zoom: 10
        setZoom: (newZoom) -> 
      spyOn map, 'setZoom'
      zoom_changed map
      expect(map.setZoom).not.toHaveBeenCalled()
      map.zoom = 16
      zoom_changed map
      expect map.setZoom
        .toHaveBeenCalledWith 14
    it "idle stores map view settings in local storage", () ->
      idle = $scope.map.events.idle
      map =
        zoom: 10
        center:
          lat: () ->
          lng: () ->
      spyOn map.center, 'lat'
        .and.returnValue 53.5
      spyOn map.center, 'lng'
        .and.returnValue -8
      spyOn localStorageService, 'set'
      idle map
      expect(localStorageService.set).toHaveBeenCalledWith 'map.zoom', 10
      expect(localStorageService.set).toHaveBeenCalledWith 'map.center.latitude', 53.5
      expect(localStorageService.set).toHaveBeenCalledWith 'map.center.longitude', -8
  describe "$scope.map.markerEvents", () ->
    # These tests are pending while we decide exactly what we want to
    # happen when the user interacts with a marker
    it "click loads divesite info"
    it "click opens an information window"
  describe "on 'filter-sites' event", () ->
    isShown = {}
    isNotShown = {}
    filterData = {}
    beforeEach () ->
      $scope.retrieveDivesites()
      $httpBackend.flush()
      isShown = (m) -> m.options.visible
      isNotShown = (m) -> !m.options.visible
      filterData = 
        category: "wreck"
        show: true
        depthRange: [0, 100]
    it "shows sites from a category which is set to true", () ->
      $rootScope.$broadcast 'event:filter-sites', filterData
      visibleMarkers = $scope.map.markers.filter isShown
      visibleMarkers.forEach (m) -> expect(m.category).toBe "wreck"
      expect(visibleMarkers.length).toBe 1
    it "does not show sites from a category which is set to false", () ->
      $rootScope.$broadcast 'event:filter-sites', filterData
      invisibleMarkers = $scope.map.markers.filter isNotShown
      invisibleMarkers.forEach (m) -> expect(m.category).toBe "scenic"
      expect(invisibleMarkers.length).toBe 1
    it "does not show sites whose chart_depth is outside the depth range", () ->
      filterData.depthRange = [30, 100]
      $rootScope.$broadcast 'event:filter-sites', filterData
      invisibleMarkers = $scope.map.markers.filter isNotShown
      expect(invisibleMarkers.length).toBe 1
      expect(invisibleMarkers[0].chart_depth).toBe 6
