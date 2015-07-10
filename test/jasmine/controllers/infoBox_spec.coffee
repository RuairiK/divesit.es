describe "InfoBoxController", ->
  beforeEach module "divesitesApp"
  $rootScope = {}
  $scope = {}
  localStorageService = {}
  beforeEach inject (_$rootScope_, _localStorageService_, $controller) ->
    $rootScope = _$rootScope_
    $scope = $rootScope.$new()
    localStorageService = _localStorageService_
    spyOn $rootScope, '$broadcast'
      .and.callThrough()
    spyOn localStorageService, 'set'
      .and.callThrough()
    $controller = $controller 'InfoBoxController', {
      $scope: $scope
      $rootScope: $rootScope
      localStorageService: localStorageService
    }

  describe "$scope.initialize()", ->
    beforeEach ->
      spyOn $scope, '$on'
      $scope.initialize()
    it "listens for 'event:site-loaded' events", ->
      expect($scope.$on).toHaveBeenCalledWith 'event:site-loaded', $scope.events.siteLoaded

  describe "$scope.events.siteLoaded()", ->
    beforeEach ->
      spyOn $scope, 'showInfoBox'
      $scope.events.siteLoaded('event:site-loaded', {})
    it "calls $scope.showInfoBox()", ->
      expect($scope.showInfoBox).toHaveBeenCalled()

  describe "$scope.dismissInfoBox()", ->
    it "makes a visible info box invisible", ->
      $scope.infoBox = {visible: true}
      $scope.dismissInfoBox()
      expect($scope.infoBox.visible).toBe false
    it "keeps an invisible info box invisible", ->
      $scope.infoBox = {visible: false}
      $scope.dismissInfoBox()
      expect($scope.infoBox.visible).toBe false

  describe "$scope.showInfoBox()", ->
    it "makes an invisible info box visible", ->
      $scope.infoBox = {visible: false}
      $scope.showInfoBox()
      expect($scope.infoBox.visible).toBe true
    it "keeps a visible info box visible", ->
      $scope.infoBox = {visible: true}
      $scope.showInfoBox()
      expect($scope.infoBox.visible).toBe true
