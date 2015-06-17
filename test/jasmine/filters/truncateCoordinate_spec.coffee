describe 'truncateCoordinate', ->
  truncateCoordinate = {}
  beforeEach -> module 'divesitesApp'
  beforeEach -> inject (_truncateCoordinateFilter_) ->
    truncateCoordinate = _truncateCoordinateFilter_
  it "converts 0 to 0", ->
    expect(truncateCoordinate 0).toBe 0
  it "converts 0.0 to 0", ->
    expect(truncateCoordinate 0.0).toBe 0
  it "converts 1.23456 to 1.234", ->
    expect(truncateCoordinate 1.23456).toBe 1.234
  it "converts -1000.111111 to -1000.111", ->
    expect(truncateCoordinate -1000.111).toBe -1000.111
