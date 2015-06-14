validation = require '../../../middleware/validation'

describe "validateBounds", ->
  validateBounds = validation.validateBounds
  it "returns false if passed nothing", ->
    validateBounds().should.be.false
  it "returns false if passed a list of less than 4 elements", ->
    validateBounds('1,2,3').should.be.false
  it "returns false if passed a list of more than 4 elements", ->
    validateBounds('1,2,3,4,5').should.be.false
  it "returns false if any bound is not a number", ->
    validateBounds('1,2,a,3').should.be.false
  it "returns true if passed a list of 4 ints", ->
    validateBounds('1,2,3,4').should.be.true
  it "returns true if passed a list of 4 floats", ->
    validateBounds('1.0,2.0,3.0,4.0').should.be.true
  it "returns true if passed a list of 4 numbers", ->
    validateBounds('1,2.0,3.0,4').should.be.true

describe "validateMapZoomLevel", ->
  validate = validation.validateMapZoomLevel
  it "returns false if passed nothing", ->
    validate().should.be.false
  it "returns false if passed something that isn't a number", ->
    validate('blah').should.be.false
  it "returns false if passed a value less than 3", ->
    validate(2).should.be.false
  it "returns false if passed a value greater than 14", ->
    validate(15).should.be.false
  it "returns true if passed an integer between 3 and 14 inclusive", ->
    [3..14].forEach (x) -> validate(x).should.be.true
