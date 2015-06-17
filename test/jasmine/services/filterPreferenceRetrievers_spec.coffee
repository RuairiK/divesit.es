describe 'FilterPreferenceRetrieversService', ->
  service = {}
  beforeEach -> module 'divesitesApp'
  beforeEach -> inject (_filterPreferenceRetrievalService_) ->
    service = _filterPreferenceRetrievalService_
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
