describe "AddSiteController", () ->
  beforeEach module "divesitesApp"
  # Put variables in scope
  $scope = {}
  localStorageService = {}

  #beforeEach inject (uiGmapIsReady, $httpBackend, $controller, $rootScope, _localStorageService_) ->
  beforeEach inject ($rootScope, $controller, _localStorageService_) ->
    $scope = $rootScope.$new()
    $scope.site =
      name: "testsite"
      depth: 20
      category: "wreck"
    localStorageService = _localStorageService_
    controller = $controller 'AddSiteController', {
      $scope: $scope,
      localStorageService: localStorageService
    }
  describe "$scope.storeChanges", () ->
    beforeEach () ->
      spyOn localStorageService, 'set'
      $scope.storeChanges()
    it "stores map center lat/lon coords and zoom in local storage", () ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.map.center.latitude', 53.5
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.map.center.longitude', -8
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.map.zoom', 7
    it "stores marker position in local storage", () ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.marker.latitude', 53.5
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.marker.longitude', -8
    it "stores site details (name, depth, category) in local storage", () ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.name', $scope.site.name
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.depth', $scope.site.depth
      expect localStorageService.set
        .toHaveBeenCalledWith 'add-site.category', $scope.site.category
  describe "$scope.submit", () ->
    it "updates $scope.site.coords", () ->
      $scope.submit()
      expect($scope.site.coords).toEqual $scope.marker.coords
    it "posts site data to /divesites/"
  describe "$scope.map.events", () ->
    it "idle handler stores changes", () ->
      spyOn $scope, 'storeChanges'
      $scope.map.events.idle()
      expect $scope.storeChanges
        .toHaveBeenCalled()
  describe "$scope.marker.events", () ->
    it "dragend handler refreshes the map and stores changes", () ->
      spyOn $scope, 'storeChanges'
      $scope.map.events.idle()
      expect $scope.storeChanges
        .toHaveBeenCalled()
