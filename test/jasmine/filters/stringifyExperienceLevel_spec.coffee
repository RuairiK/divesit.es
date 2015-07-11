describe 'stringifyExperienceLevel', ->
  stringifyExperienceLevel = {}
  beforeEach -> module 'divesitesApp'
  beforeEach -> inject (_stringifyExperienceLevelFilter_) ->
    stringifyExperienceLevel = _stringifyExperienceLevelFilter_
  it "converts 0 to 'Beginner'", ->
    expect(stringifyExperienceLevel 0).toBe "Beginner"
  it "converts 1 to 'Intermediate'", ->
    expect(stringifyExperienceLevel 1).toBe "Intermediate"
  it "converts 2 to 'Advanced'", ->
    expect(stringifyExperienceLevel 2).toBe "Advanced"
  it "converts anything else to 'Advanced'", ->
    expect(stringifyExperienceLevel()).toBe "Advanced"
