MOCK_DATA = [
  {
    "_id": "54f5c339d65093780e3a3f14"
    "loc": [-6.05441, 53.27209]
    "name": "HMS GUIDE ME II"
    "depth": 32.706
    "updated_at": "2015-03-16T17:32:08.991Z"
    "boatEntry": true
    "shoreEntry": false
    "description": "A wreck boat dive"
    "minimumLevel": 2
  },
  {
    "id": "54f5d4f1506054993d9e98c6"
    "loc": [-8.44224214553833, 51.69350895045772]
    "name": "Oysterhaven slip"
    "depth": 6
    "updated_at": "2015-03-03T15:36:17.899Z"
    "boatEntry": false
    "shoreEntry": true
    "description": "A shore dive"
    "minimumLevel": 0
  }
]
describe "MapController", ->
  beforeEach () -> module 'divesitesApp'
  $scope = {}
  $rootScope = {}
  $httpBackend = {}
  localStorageService = {}
  beforeEach inject (_$rootScope_, _localStorageService_, _$httpBackend_, _$controller_) ->
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()
    localStorageService = _localStorageService_
    $httpBackend = _$httpBackend_
    $httpBackend.when "GET", "/divesites/"
      .respond MOCK_DATA
    $httpBackend.when "GET", "/divesites/" + MOCK_DATA[0]._id
      .respond MOCK_DATA[0]
    $controller = _$controller_ "MapController", {
      $scope: $scope
      $rootScope: $rootScope
      localStorageService: localStorageService
    }

  describe "$scope.retrieveDivesites", ->
    it "populates $scope.map.markers", ->
      $scope.retrieveDivesites()
      $httpBackend.flush()
      expect $scope.map.markers.length
        .toBe 2
    it "broadcasts an event called 'event:divesites-loaded'", ->
      spyOn $rootScope, "$broadcast"
        .and.callThrough
      $scope.retrieveDivesites()
      $httpBackend.flush()
      expect $rootScope.$broadcast
        .toHaveBeenCalledWith 'event:divesites-loaded'
  describe "$scope.map.events", ->
    describe "zoom_changed handler", ->
      it "does not allow zoom level greater than 14", ->
        zoom_changed = $scope.map.events.zoom_changed
        map =
          zoom: 10
          setZoom: (newZoom) ->
        spyOn map, 'setZoom'
        zoom_changed map
        expect map.setZoom
          .not.toHaveBeenCalled()
        map.zoom = 16
        zoom_changed map
        expect map.setZoom
          .toHaveBeenCalledWith 14
      it "does not allow zoom level less than 3", ->
        zoom_changed = $scope.map.events.zoom_changed
        map =
          zoom: 10
          setZoom: (newZoom) ->
        spyOn map, 'setZoom'
        map.zoom = 2
        zoom_changed map
        expect map.setZoom
          .toHaveBeenCalledWith 3

    describe "idle handler", ->
      it "stores map view settings in local storage", ->
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
        expect localStorageService.set
          .toHaveBeenCalledWith 'map.zoom', 10
        expect localStorageService.set
          .toHaveBeenCalledWith 'map.center.latitude', 53.5
        expect localStorageService.set
          .toHaveBeenCalledWith 'map.center.longitude', -8

  describe "filtering [starting from all shown]", ->
    isShown = (m) -> m.options.visible
    isNotShown = (m) -> !m.options.visible
    beforeEach ->
      $scope.retrieveDivesites()
      $httpBackend.flush()
      $scope.map.markers.forEach (m) ->
        m.filterVisibility.boatEntry = true
        m.filterVisibility.shoreEntry = true
        m.filterVisibility.depthRange = true
        m.filterVisibility.minimumLevel = true
    describe "event:filter-depth-range", ->
      it "excludes sites that are too shallow", ->
        filterData = {depthRange: [10, 100]}
        $rootScope.$broadcast 'event:filter-depth-range', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "excludes sites that are too deep", ->
        filterData = {depthRange: [0, 30]}
        $rootScope.$broadcast 'event:filter-depth-range', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "shows everything if the full range is selected", ->
        filterData = {depthRange: [0, 100]}
        $rootScope.$broadcast 'event:filter-depth-range', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 2
    describe "event:filter-entry-type", ->
      it "shows only sites with the desired entry type", ->
        filterData = {shoreEntry: false}
        $rootScope.$broadcast 'event:filter-entry-type', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "doesn't show any sites if both entry types are false", ->
        filterData = {shoreEntry: false, boatEntry: false}
        $rootScope.$broadcast 'event:filter-entry-type', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 0
      it "shows all sites if both entry types are true", ->
        filterData = {shoreEntry: true, boatEntry: true}
        $rootScope.$broadcast 'event:filter-entry-type', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 2

    describe "event:filter-minimum-level", ->
      it "shows only sites that meet the minimum level requirement", ->
        filterData = {minimumLevel: 1}
        $rootScope.$broadcast 'event:filter-minimum-level', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "shows all sites that meet the minimum level requirement", ->
        filterData = {minimumLevel: 0}
        $rootScope.$broadcast 'event:filter-minimum-level', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 2
