describe "FilterMenuController", ->
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
    $controller = $controller 'FilterMenuController', {
      $scope: $scope
      $rootScope: $rootScope
      localStorageService: localStorageService
    }

  describe "$scope.initialize", ->
    beforeEach ->
      spyOn $scope, '$on'
      $scope.initialize()
    it "listens for 'event:divesites-loaded' events", ->
      expect($scope.$on).toHaveBeenCalledWith 'event:divesites-loaded', $scope.retrieveFilterPreferences

  describe "$scope.filterValidators", ->
    describe "entryType", ->
      entryType = {}
      beforeEach -> entryType = $scope.filterValidators.entryType
      it "returns true if passed 'true'", -> expect(entryType 'true').toBe true
      it "returns true if passed true (boolean)", -> expect(entryType true).toBe true
      it "returns true if passed 'false'", -> expect(entryType 'false').toBe true
      it "returns true if passed false (boolean)", -> expect(entryType false).toBe true
      it "returns false if passed an empty string", -> expect(entryType "").toBe false
      it "returns false if passed an Array", -> expect(entryType [1,2,3]).toBe false
      it "return false if passed an object", -> expect(entryType {false: true}).toBe false
    describe "depthRange", ->
      depthRange = {}
      beforeEach -> depthRange = $scope.filterValidators.depthRange
      it "returns true if passed [0, 100]", -> expect(depthRange [0, 100]).toBe true
      it "returns false if passed [-1, 100]", -> expect(depthRange [-1, 100]).toBe false
      it "returns false if passed [0, 101]", -> expect(depthRange [0, 101]).toBe false
    describe "minimumLevel", ->
      minimumLevel = {}
      beforeEach -> minimumLevel = $scope.filterValidators.minimumLevel
      it "returns true if passed 0", -> expect(minimumLevel 0).toBe true
      it "returns true if passed 1", -> expect(minimumLevel 1).toBe true
      it "returns true if passed 2", -> expect(minimumLevel 2).toBe true

  describe "$scope.sendFilterPreferences", ->
    beforeEach ->
      localStorageService.clearAll()
      $scope.filterPreferences =
        boatEntry: true
        shoreEntry: false
        depthRange: [0, 50]
        minimumLevel: 0
      spyOn $rootScope, '$broadcast'
      $scope.sendFilterPreferences()
      it "broadcasts an 'event:filter-preferences' event", ->
        expect($rootScope.$broadcast).toHaveBeenCalledWith $scope.filterPreferences

  describe "$scope.retrieveFilterPreferences", ->
    beforeEach ->
      localStorageService.clearAll()
      localStorageService.set('filterPreferences.boatEntry', true)
      localStorageService.set('filterPreferences.shoreEntry', false)
      localStorageService.set('filterPreferences.depthRange', [0, 50])
      localStorageService.set('filterPreferences.minimumLevel', 1)

    describe "with valid stored preferences", ->
      beforeEach ->
        localStorageService.set('filterPreferences.boatEntry', true)
        localStorageService.set('filterPreferences.shoreEntry', false)
        localStorageService.set('filterPreferences.depthRange', [0, 50])
        localStorageService.set('filterPreferences.minimumLevel', 1)
        spyOn localStorageService, 'get'
          .and.callThrough()
        spyOn $scope, 'sendFilterPreferences'
        $scope.retrieveFilterPreferences()
      afterEach ->
        localStorageService.clearAll()
      it "calls $scope.sendFilterPreferences", ->
        expect($scope.sendFilterPreferences).toHaveBeenCalled()
      it "retrieves filterPreferences.boatEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "retrieves filterPreferences.shoreEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "retrieves filterPreferences.depthRange from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "retrieves filterPreferences.minimumLevel from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith "filterPreferences.minimumLevel"
      it "sets $scope.filterPreferences.boatEntry", ->
        expect($scope.filterPreferences.boatEntry).toBe true
      it "sets $scope.filterPreferences.shoreEntry", ->
        expect($scope.filterPreferences.shoreEntry).toBe false
      it "sets $scope.filterPreferences.depthRange", ->
        expect($scope.filterPreferences.depthRange).toEqual [0, 50]
      it "sets $scope.filterPreferences.minimumLevel", ->
        expect($scope.filterPreferences.minimumLevel).toBe 1
    
    describe "with invalid stored preferences", ->
      beforeEach ->
        localStorageService.clearAll()
        localStorageService.set 'filterPreferences.boatEntry', 5
        localStorageService.set 'filterPreferences.shoreEntry', [6, 5]
        localStorageService.set 'filterPreferences.depthRange', "nope"
        localStorageService.set 'filterPreferences.minimumLevel', {foo: 5}
        spyOn localStorageService, 'get'
        spyOn $scope, 'sendFilterPreferences'
        $scope.retrieveFilterPreferences()
      it "calls $scope.sendFilterPreferences", ->
        expect($scope.sendFilterPreferences).toHaveBeenCalled()
      it "retrieves filterPreferences.boatEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "retrieves filterPreferences.shoreEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "retrieves filterPreferences.depthRange from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "retrieves filterPreferences.minimumLevel from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith "filterPreferences.minimumLevel"
      it "sets $scope.filterPreferences.boatEntry to true", ->
        expect($scope.filterPreferences.boatEntry).toBe true
      it "sets $scope.filterPreferences.shoreEntry to true", ->
        expect($scope.filterPreferences.shoreEntry).toBe true
      it "sets $scope.filterPreferences.depthRange to [0, 100]", ->
        expect($scope.filterPreferences.depthRange).toEqual [0, 100]
      it "sets $scope.filterPreferences.minimumLevel to 0", ->
        expect($scope.filterPreferences.minimumLevel).toBe 0

    describe "without stored preferences", ->
      beforeEach ->
        localStorageService.clearAll()
        spyOn localStorageService, 'get'
        spyOn $scope, 'sendFilterPreferences'
        $scope.retrieveFilterPreferences()
      it "calls $scope.sendFilterPreferences", ->
        expect($scope.sendFilterPreferences).toHaveBeenCalled()
      it "doesn't try to retrieve filterPreferences.minimumLevel", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.minimumLevel'
      it "doesn't try to retrieve filterPreferences.boatEntry", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "doesn't try to retrieve filterPreferences.shoreEntry", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "doesn't try to retrieve filterPreferences.depthRange", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "sets $scope.filterPreferences.boatEntry to true", ->
        expect($scope.filterPreferences.boatEntry).toBe true
      it "sets $scope.filterPreferences.shoreEntry to true", ->
        expect($scope.filterPreferences.shoreEntry).toBe true
      it "sets $scope.filterPreferences.depthRange to [0, 100]", ->
        expect($scope.filterPreferences.depthRange).toEqual [0, 100]
      it "sets $scope.filterPreferences.minimumLevel to 0", ->
        expect($scope.filterPreferences.minimumLevel).toBe 0
