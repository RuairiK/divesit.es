describe "SidebarController", () ->
  beforeEach module 'divesitesApp'
  $scope = {}
  $rootScope = {}
  localStorageService = {}
  $controller = {}
  beforeEach inject (_$rootScope_, $controller, _localStorageService_) ->
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()
    localStorageService = _localStorageService_
    spyOn($rootScope, '$broadcast').and.callThrough()
    spyOn(localStorageService, 'set').and.callThrough()
    $controller = $controller 'SidebarController', {
      $scope: $scope
      $rootScope: $rootScope
      localStorageService: localStorageService
    }
    # I'd love to know why this errors if we put it above the call
    # to $controller.
    spyOn($scope, 'updateAllCategories').and.callThrough()
  describe "$scope.filterSites", () ->
    it "broadcasts a 'filter-sites' event", () ->
      $scope.filterSites 'wreck', true
      expectedData = {
        category: 'wreck'
        show: true
        depthRange: [0, 100]
      }
      # TODO: fix this yourself
      expect($rootScope.$broadcast)
        .toHaveBeenCalledWith('event:filter-sites', expectedData)
    it "stores filter preferences in local storage", () ->
      expectedData = {
        categories:
          wreck: true
          scenic: true
          drift: true
        depthRange: [0, 100]
      }
      #spyOn($rootScope, '$broadcast')
      expect(localStorageService.set)
        .toHaveBeenCalledWith 'filterPreferences', expectedData
  describe "$scope.formatSliderTooltip", () ->
    it "returns the depth with 'm' appended", () ->
      expect $scope.formatSliderTooltip 10
        .toBe "10m"
  describe "$scope.onSlide", () ->
    it "updates all categories", () ->
      $scope.onSlide()
      expect $scope.updateAllCategories
        .toHaveBeenCalled()
  describe "$scope.updateAllCategories", () ->
    it "broadcasts a 'filter-sites' event for each category", () ->
      $scope.updateAllCategories()
      expect $rootScope.$broadcast
        .toHaveBeenCalledWith 'event:filter-sites', jasmine.objectContaining {category: 'wreck'}
      expect $rootScope.$broadcast
        .toHaveBeenCalledWith 'event:filter-sites', jasmine.objectContaining {category: 'scenic'}
      expect $rootScope.$broadcast
        .toHaveBeenCalledWith 'event:filter-sites', jasmine.objectContaining {category: 'drift'}
  describe "On map-isready event", () ->
    it "updates all categories", () ->
      $rootScope.$broadcast 'event:map-isready'
      expect $scope.updateAllCategories
        .toHaveBeenCalled()
