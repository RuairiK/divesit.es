MOCK_DATA = [
  {
    "_id": "54f5c339d65093780e3a3f14"
    "loc": {longitude: -6.05441, latitude: 53.27209}
    "name": "HMS GUIDE ME II"
    "depth": 32.706
    "createdAt": "2015-03-16T17:32:08.991Z"
    "updatedAt": "2015-03-16T17:32:08.991Z"
    "boatEntry": true
    "shoreEntry": false
    "description": "A wreck boat dive"
    "minimumLevel": 2
  },
  {
    "id": "54f5d4f1506054993d9e98c6"
    "loc": {longitude: -8.44224214553833, latitude: 51.69350895045772}
    "name": "Oysterhaven slip"
    "depth": 6
    "createdAt": "2015-03-03T15:36:17.899Z"
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
  uiGmapIsReady = {}
  beforeEach inject (_$rootScope_, _localStorageService_, _$httpBackend_, _$controller_, _uiGmapIsReady_) ->
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
    uiGmapIsReady = _uiGmapIsReady_
  describe "$scope.initialize()", ->
    beforeEach ->
      spyOn uiGmapIsReady, 'promise'
        .and.callThrough()
      spyOn $scope, '$on'
      $scope.initialize()
    it "calls uiGmapIsReady.promise)", ->
      expect(uiGmapIsReady.promise).toHaveBeenCalled()
    it "registers an event listener for 'event:filter-preferences'", ->
      expect($scope.$on).toHaveBeenCalledWith 'event:filter-preferences', $scope.events.filterPreferences
    it "registers an event listener for 'event:map-is-ready'", ->
      expect($scope.$on).toHaveBeenCalledWith 'event:map-is-ready', $scope.events.mapIsReady

  describe "$scope.filterPreferences", ->
    beforeEach ->
      filterData =
        boatEntry: true
        shoreEntry: true
        depthRange: [0, 100]
        minimumLevel: 1
      spyOn $scope, "filterMarker"
      $scope.filterPreferences 'event:filter-preferences', filterData
      it "calls $scope.filterMarker", ->
        expect($scope.filterMarker).toHaveBeenCalled()

  describe "$scope.uiGmapIsReady", ->
    beforeEach ->
      spyOn $rootScope, '$broadcast'
        .and.callThrough()
      $scope.uiGmapIsReady()
    it "broadcasts an event called 'event:map-is-ready'", ->
      expect($rootScope.$broadcast).toHaveBeenCalledWith 'event:map-is-ready'

  describe "$scope.checkMinimumLevel(marker, data)", ->
    f = {}
    beforeEach -> f = $scope.checkMinimumLevel
    # Marker is at the same difficulty level as the filter pref
    it "(0, 0) -> true", ->
      m = {minimumLevel: 0}
      d = {maximumLevel: 0}
      expect(f m, d).toBe true
    # Marker is more difficult than the filter pref
    it "(1, 0) -> false", ->
      m = {minimumLevel: 1}
      d = {maximumLevel: 0}
      expect(f m, d).toBe false
    # Marker is more difficult than the filter pref
    it "(2, 0) -> false", ->
      m = {minimumLevel: 2}
      d = {maximumLevel: 0}
      expect(f m, d).toBe false
    # Marker is less difficult than the filter pref
    it "(0, 1) -> true", ->
      m = {minimumLevel: 0}
      d = {maximumLevel: 1}
      expect(f m, d).toBe true
    # Marker is less difficult than the filter pref
    it "(0, 2) -> true", ->
      m = {minimumLevel: 0}
      d = {maximumLevel: 2}
      expect(f m, d).toBe true

  describe "$scope.checkEntryTypes", ->
    f = {}
    beforeEach -> f = $scope.checkEntryTypes
    describe "marker = {boatEntry: true, shoreEntry: true}", ->
      marker = {}
      beforeEach -> marker = {boatEntry: true, shoreEntry: true}
      it "data: {boatEntry: true, shoreEntry: true} -> true", ->
        data = {boatEntry: true, shoreEntry: true}
        expect(f marker, data).toBe true
      it "data: {boatEntry: false, shoreEntry: true} -> true", ->
        data = {boatEntry: false, shoreEntry: true}
        expect(f marker, data).toBe true
      it "data: {boatEntry: true, shoreEntry: false} -> true", ->
        data = {boatEntry: true, shoreEntry: false}
        expect(f marker, data).toBe true
      it "data: {boatEntry: false, shoreEntry: false} -> false", ->
        data = {boatEntry: false, shoreEntry: false}
        expect(f marker, data).toBe false

    describe "marker = {boatEntry: false, shoreEntry: true}", ->
      marker = {}
      beforeEach -> marker = {boatEntry: false, shoreEntry: true}
      it "data: {boatEntry: true, shoreEntry: true} -> true", ->
        data = {boatEntry: true, shoreEntry: true}
        expect(f marker, data).toBe true
      it "data: {boatEntry: false, shoreEntry: true} -> true", ->
        data = {boatEntry: false, shoreEntry: true}
        expect(f marker, data).toBe true
      it "data: {boatEntry: true, shoreEntry: false} -> false", ->
        data = {boatEntry: true, shoreEntry: false}
        expect(f marker, data).toBe false
      it "data: {boatEntry: false, shoreEntry: false} -> false", ->
        data = {boatEntry: false, shoreEntry: false}
        expect(f marker, data).toBe false

    describe "marker = {boatEntry: true, shoreEntry: false}", ->
      marker = {}
      beforeEach -> marker = {boatEntry: true, shoreEntry: false}
      it "data: {boatEntry: true, shoreEntry: true} -> true", ->
        data = {boatEntry: true, shoreEntry: true}
        expect(f marker, data).toBe true
      it "data: {boatEntry: false, shoreEntry: true} -> false", ->
        data = {boatEntry: false, shoreEntry: true}
        expect(f marker, data).toBe false
      it "data: {boatEntry: true, shoreEntry: false} -> true", ->
        data = {boatEntry: true, shoreEntry: false}
        expect(f marker, data).toBe true
      it "data: {boatEntry: false, shoreEntry: false} -> false", ->
        data = {boatEntry: false, shoreEntry: false}
        expect(f marker, data).toBe false

  
  describe "$scope.retrieveDivesites", ->
    beforeEach ->
      spyOn $rootScope, "$broadcast"
        .and.callThrough()
      $scope.retrieveDivesites()
      $httpBackend.flush()
    it "populates $scope.map.markers", ->
      expect $scope.map.markers.length
        .toBe 2
    it "populates $scope.map.markers with properly formatted data", ->
    it "broadcasts an event called 'event:divesites-loaded'", ->
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

  describe "$scope.map.markerEvents", ->

  describe "filtering [starting from all shown]", ->
    isShown = (m) -> m.options.visible
    isNotShown = (m) -> !m.options.visible
    beforeEach ->
      $scope.retrieveDivesites()
      $httpBackend.flush()
      $scope.map.markers.forEach (m) ->
        m.filterVisibility.entryType = true
        m.filterVisibility.depthRange = true
        m.filterVisibility.minimumLevel = true

    describe "filtering depth ranges", ->
      filterData = {}
      beforeEach ->
        filterData =
          boatEntry: true
          shoreEntry: true
          maximumLevel: 2
      it "excludes sites that are too shallow", ->
        filterData.depthRange = [10, 100]
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "excludes sites that are too deep", ->
        filterData.depthRange = [0, 30]
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "shows everything if the full range is selected", ->
        filterData.depthRange = [0, 100]
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 2

    describe "filtering entry types", ->
      filterData = {}
      beforeEach ->
        filterData =
          boatEntry: true
          shoreEntry: true
          maximumLevel: 2
          depthRange: [0, 100]
      it "shows only sites with the desired entry type", ->
        filterData.shoreEntry = false
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "doesn't show any sites if both entry types are false", ->
        filterData.shoreEntry = false
        filterData.boatEntry = false
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 0
      it "shows all sites if both entry types are true", ->
        filterData.boatEntry = true
        filterData.shoreEntry = true
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 2

    describe "filtering on level", ->
      filterData = {}
      beforeEach ->
        filterData =
          boatEntry: true
          shoreEntry: true
          depthRange: [0, 100]
          maximumLevel: 1
      it "shows only sites that meet the maximum level requirement (maximumLevel: 0)", ->
        filterData.maximumLevel = 0
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "shows only sites that meet the maximum level requirement (maximumLevel: 1)", ->
        filterData.maximumLevel = 0
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 1
      it "shows only sites that meet the maximum level requirement (maximumLevel: 2)", ->
        filterData.maximumLevel = 2
        $rootScope.$broadcast 'event:filter-preferences', filterData
        visibleMarkers = $scope.map.markers.filter isShown
        expect visibleMarkers.length
          .toBe 2
