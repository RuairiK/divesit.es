describe "<sidebar>", () ->
  $compile = {}
  $rootScope = {}

  beforeEach inject (_$rootScope_, _$compile_) ->
    $compile = _$compile_
    $rootScope = _$rootScope_

  it "replaces the element with the appropriate content"
