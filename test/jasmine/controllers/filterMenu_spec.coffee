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
      spyOn $scope, 'retrieveFilterPreferences'
      $scope.initialize()
    it "retrieves filter preferences from local storage", ->
      expect($scope.retrieveFilterPreferences).toHaveBeenCalled()
    it "listens for 'event:divesites-loaded' events", ->
      expect($scope.$on).toHaveBeenCalledWith 'event:divesites-loaded', $scope.updateAndSendFilterPreferences

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
      maximumLevel = {}
      beforeEach -> maximumLevel = $scope.filterValidators.maximumLevel
      it "returns true if passed 0", -> expect(maximumLevel 0).toBe true
      it "returns true if passed 1", -> expect(maximumLevel 1).toBe true
      it "returns true if passed 2", -> expect(maximumLevel 2).toBe true

  describe "$scope.storeFilterPreferences", ->
    $scope.filterPreferences = {}
    beforeEach ->
      localStorageService.clearAll()
      $scope.filterPreferences =
        boatEntry: true
        shoreEntry: false
        depthRange: [0, 50]
        maximumLevel: 0
      $scope.storeFilterPreferences()
    it "stores filterPreferences.boatEntry", ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'filterPreferences.boatEntry', $scope.filterPreferences.boatEntry
    it "stores filterPreferences.shoreEntry", ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'filterPreferences.shoreEntry', $scope.filterPreferences.shoreEntry
    it "stores filterPreferences.depthRange", ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'filterPreferences.depthRange', $scope.filterPreferences.depthRange
    it "stores filterPreferences.maximumLevel", ->
      expect localStorageService.set
        .toHaveBeenCalledWith 'filterPreferences.maximumLevel', $scope.filterPreferences.maximumLevel

  describe "$scope.updateAndSendFilterPreferences", ->
    beforeEach ->
      localStorageService.clearAll()
      $scope.filterPreferences =
        boatEntry: true
        shoreEntry: false
        depthRange: [0, 50]
        maximumLevel: 0
      spyOn $rootScope, '$broadcast'
      $scope.updateAndSendFilterPreferences()
      it "broadcasts an 'event:filter-preferences' event", ->
        expect($rootScope.$broadcast).toHaveBeenCalledWith $scope.filterPreferences

  describe "$scope.retrieveFilterPreferences", ->
    beforeEach ->
      localStorageService.clearAll()
      #localStorageService.set('filterPreferences.boatEntry', true)
      #localStorageService.set('filterPreferences.shoreEntry', false)
      #localStorageService.set('filterPreferences.depthRange', [0, 50])
      #localStorageService.set('filterPreferences.maximumLevel', 1)

    describe "with valid stored preferences", ->
      beforeEach ->
        localStorageService.clearAll()
        localStorageService.set('filterPreferences.boatEntry', true)
        localStorageService.set('filterPreferences.shoreEntry', false)
        localStorageService.set('filterPreferences.depthRange', [0, 50])
        localStorageService.set('filterPreferences.maximumLevel', 1)
        spyOn localStorageService, 'get'
          .and.callThrough()
        spyOn $scope, 'updateAndSendFilterPreferences'
        $scope.retrieveFilterPreferences()
      it "retrieves filterPreferences.boatEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "retrieves filterPreferences.shoreEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "retrieves filterPreferences.depthRange from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "retrieves filterPreferences.maximumLevel from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith "filterPreferences.maximumLevel"
      it "sets $scope.filterPreferences.boatEntry", ->
        expect($scope.filterPreferences.boatEntry).toBe true
      it "sets $scope.filterPreferences.shoreEntry", ->
        expect($scope.filterPreferences.shoreEntry).toBe false
      it "sets $scope.filterPreferences.depthRange", ->
        expect($scope.filterPreferences.depthRange).toEqual [0, 50]
      it "sets $scope.filterPreferences.maximumLevel", ->
        expect($scope.filterPreferences.maximumLevel).toBe 1
    
    describe "with invalid stored preferences", ->
      beforeEach ->
        localStorageService.clearAll()
        localStorageService.set 'filterPreferences.boatEntry', 5
        localStorageService.set 'filterPreferences.shoreEntry', [6, 5]
        localStorageService.set 'filterPreferences.depthRange', "nope"
        localStorageService.set 'filterPreferences.maximumLevel', {foo: 5}
        spyOn localStorageService, 'get'
        spyOn $scope, 'updateAndSendFilterPreferences'
        $scope.retrieveFilterPreferences()
      it "retrieves filterPreferences.boatEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "retrieves filterPreferences.shoreEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "retrieves filterPreferences.depthRange from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "retrieves filterPreferences.maximumLevel from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith "filterPreferences.maximumLevel"
      it "sets $scope.filterPreferences.boatEntry to true", ->
        expect($scope.filterPreferences.boatEntry).toBe true
      it "sets $scope.filterPreferences.shoreEntry to true", ->
        expect($scope.filterPreferences.shoreEntry).toBe true
      it "sets $scope.filterPreferences.depthRange to [0, 100]", ->
        expect($scope.filterPreferences.depthRange).toEqual [0, 100]
      it "sets $scope.filterPreferences.maximumLevel to 2", ->
        expect($scope.filterPreferences.maximumLevel).toBe 2

    describe "without stored preferences", ->
      beforeEach ->
        localStorageService.clearAll()
        spyOn localStorageService, 'get'
        spyOn $scope, 'updateAndSendFilterPreferences'
        $scope.retrieveFilterPreferences()
      it "doesn't try to retrieve filterPreferences.maximumLevel", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.maximumLevel'
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
      it "sets $scope.filterPreferences.maximumLevel to 2", ->
        expect($scope.filterPreferences.maximumLevel).toBe 2
