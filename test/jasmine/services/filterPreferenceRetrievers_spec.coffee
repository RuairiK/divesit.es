describe 'filterPreferenceRetrievalService', ->
  service = {}
  ls = {}
  beforeEach -> module 'divesitesApp'
  beforeEach -> inject (_filterPreferenceRetrievalService_, _localStorageService_) ->
    service = _filterPreferenceRetrievalService_
    ls = _localStorageService_
  describe "validators", ->
    describe "validators.entryType", ->
      entryType = {}
      beforeEach -> entryType = service.validators.entryType
      expectedResults = [
        [true, true]
        ['true', true]
        [false, true]
        ['false', true]
        [0, false]
        [{}, false]
      ]
      expectedResults.forEach (pair) ->
        it "#{pair[0]} (#{typeof pair[0]}) -> #{pair[1]}", -> expect(entryType pair[0]).toBe pair[1]
    describe "validators.depthRange", ->
      depthRange = {}
      beforeEach -> depthRange = service.validators.depthRange
      expectedResults = [
        [[0, 100], true]
        [[-1, 100], false]
        [[0, 101], false]
      ]
      expectedResults.forEach (pair) ->
        it "#{pair[0]} (#{typeof pair[0]}) -> #{pair[1]}", -> expect(depthRange pair[0]).toBe pair[1]
    describe "validators.maximumLevel", ->
      maximumLevel = {}
      beforeEach -> maximumLevel = service.validators.maximumLevel
      expectedResults = [
        [0, true]
        [1, true]
        [2, true]
      ]
      expectedResults.forEach (pair) ->
        it "#{pair[0]} (#{typeof pair[0]}) -> #{pair[1]}", -> expect(maximumLevel pair[0]).toBe pair[1]

  describe "retrievers", ->
    boatEntry = {}
    shoreEntry = {}
    depthRange = {}
    maximumLevel = {}
    beforeEach ->
      ls.clearAll()
      boatEntry = service.boatEntry
      shoreEntry = service.shoreEntry
      depthRange = service.depthRange
      maximumLevel = service.maximumLevel
    describe "boatEntry", ->
      it "returns a valid stored preference", ->
        ls.set 'filterPreferences.boatEntry', true
        expect(boatEntry()).toBe true
        ls.set 'filterPreferences.boatEntry', false
        expect(boatEntry()).toBe false
      it "returns the default preference if nothing is stored", ->
        expect(boatEntry()).toBe true
      it "returns the default preference if bogus data is stored", ->
        ls.set "filterPreferences.boatEntry", {}
        expect(boatEntry()).toBe true
    describe "shoreEntry", ->
      it "returns a valid stored preference", ->
        ls.set 'filterPreferences.shoreEntry', true
        expect(shoreEntry()).toBe true
        ls.set 'filterPreferences.shoreEntry', false
        expect(shoreEntry()).toBe false
      it "returns the default preference if nothing is stored", ->
        expect(shoreEntry()).toBe true
      it "returns the default preference if bogus data is stored", ->
        ls.set "filterPreferences.shoreEntry", {}
        expect(shoreEntry()).toBe true
    describe "depthRange", ->
      it "returns a valid stored preference", ->
        validPreferences = [
          [0, 100], [100, 100], [0, 0], [0, 50], [0.25, 50], [1.25, 8.25]
        ]
        validPreferences.forEach (range) ->
          ls.set 'filterPreferences.depthRange', range
          expect(depthRange(range)).toEqual range, "#{range}"
      it "returns the default preference if nothing is stored", ->
        expect(depthRange()).toEqual [0, 100]
      it "returns the default preference if bogus data is stored", ->
        invalidPreferences = [
          [0], [-1, 100], [1, 101], "blort", {}, 44, []
        ]
        invalidPreferences.forEach (range) ->
          ls.set 'filterPreferences.depthRange', range
          expect(depthRange(range)).toEqual [0, 100]
