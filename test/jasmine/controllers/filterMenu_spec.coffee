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
      localStorageService.clearAll()

    describe "with stored preferences", ->
      beforeEach ->
        localStorageService.set('filterPreferences.boatEntry', true)
        localStorageService.set('filterPreferences.shoreEntry', false)
        localStorageService.set('filterPreferences.depthRange', [0, 50])
        localStorageService.set('filterPreferences.minimumLevel', 1)
        spyOn localStorageService, 'get'
          .and.callThrough()
        spyOn $scope, 'filterEntryType'
        spyOn $scope, 'filterDepthRange'
        spyOn $scope, 'filterMinimumLevel'
        $scope.initialize()
      afterEach ->
        localStorageService.clearAll()
      it "retrieves filterPreferences.boatEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "calls $scope.filterEntryType('boat', show)", ->
        expect($scope.filterEntryType).toHaveBeenCalledWith 'boat', true

      it "retrieves filterPreferences.shoreEntry from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "calls $scope.filterEntryType('shore', show)", ->
        expect($scope.filterEntryType).toHaveBeenCalledWith 'shore', false

      it "retrieves filterPreferences.depthRange from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "calls $scope.filterDepthRange([0, 50])", ->
        expect($scope.filterDepthRange).toHaveBeenCalledWith [0, 50]

      it "retrieves filterPreferences.minimumLevel from local storage", ->
        expect(localStorageService.get).toHaveBeenCalledWith "filterPreferences.minimumLevel"
      it "calls $scope.filterMinimumLevel(1)", ->
        expect($scope.filterMinimumLevel).toHaveBeenCalledWith 1

    describe "without stored preferences", ->
      beforeEach ->
        spyOn localStorageService, 'get'
        spyOn $scope, 'filterEntryType'
        spyOn $scope, 'filterDepthRange'
        spyOn $scope, 'filterMinimumLevel'
        $scope.initialize()
      it "doesn't try to retrieve filterPreferences.boatEntry", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.boatEntry'
      it "calls $scope.filterEntryType('boat, true)", ->
        expect($scope.filterEntryType).toHaveBeenCalledWith 'boat', true
      it "doesn't try to retrieve filterPreferences.shoreEntry", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.shoreEntry'
      it "calls $scope.filterEntryType('shore', true)", ->
        expect($scope.filterEntryType).toHaveBeenCalledWith 'shore', true
      it "doesn't try to retrieve filterPreferences.depthRange", ->
        expect(localStorageService.get).not.toHaveBeenCalledWith 'filterPreferences.depthRange'
      it "calls $scope.filterDepthRange(0, 100)", ->
        expect($scope.filterDepthRange).toHaveBeenCalledWith [0, 100]

  describe "$scope.filterBoatEntry", ->
    beforeEach -> $scope.filterBoatEntry true
    it "sets $scope.filterPreferences.boatEntry", ->
      expect($scope.filterPreferences.boatEntry).toBe true
    it "stores filterPreferences.boatEntry in local storage", ->
      expect(localStorageService.set).toHaveBeenCalledWith 'filterPreferences.boatEntry', true
    it "broadcasts an event called 'event:filter-entry-type", ->
      expect($rootScope.$broadcast).toHaveBeenCalledWith 'event:filter-entry-type', {boat: true}

  describe "$scope.filterShoreEntry", ->
    beforeEach -> $scope.filterShoreEntry true
    it "sets $scope.filterPreferences.shoreEntry", ->
      expect($scope.filterPreferences.shoreEntry).toBe true
    it "stores filterPreferences.shoreEntry in local storage", ->
      expect(localStorageService.set).toHaveBeenCalledWith 'filterPreferences.shoreEntry', true
    it "broadcasts an event called 'event:filter-entry-type", ->
      expect($rootScope.$broadcast).toHaveBeenCalledWith 'event:filter-entry-type', {shore: true}

  describe "$scope.filterDepthRange", ->
    beforeEach -> $scope.filterDepthRange [0, 50]
    it "sets $scope.filterPreferences.depthRange", ->
      expect($scope.filterPreferences.depthRange).toEqual [0, 50]
    it "stores filterPreferences.depthRange in local storage", ->
      expect(localStorageService.set).toHaveBeenCalledWith 'filterPreferences.depthRange', [0, 50]
    it "broadcasts an event called 'event:filter-depth-range", ->
      expect($rootScope.$broadcast).toHaveBeenCalledWith 'event:filter-depth-range', {depthRange: [0, 50]}

  describe "$scope.filterMinimumLevel", ->
    beforeEach -> $scope.filterMinimumLevel 1
    it "sets $scope.filterPreferences.minimumLevel", ->
      expect($scope.filterPreferences.minimumLevel).toBe 1
    it "stores filterPreferences.minimumLevel in local storage", ->
      expect(localStorageService.set).toHaveBeenCalledWith 'filterPreferences.minimumLevel', 1
    it "broadcasts an event called 'event:filter-minimum-level", ->
      expect($rootScope.$broadcast).toHaveBeenCalledWith 'event:filter-minimum-level', {minimumLevel: 1}
