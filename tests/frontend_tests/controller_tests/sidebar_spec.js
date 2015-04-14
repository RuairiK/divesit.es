describe('SidebarController', function() {
  beforeEach(module('divesitesApp'));
  
  var scope, controller, rootScope, cookieStore;
  beforeEach(inject(function ($rootScope, $controller, $cookieStore) {
	  //set up a new scope and the controller for the test
	  scope = $rootScope.$new();
	  rootScope = $rootScope;
	  cookieStore = $cookieStore;
	  spyOn(rootScope, '$broadcast').and.callThrough();
	  spyOn(cookieStore, 'put').and.callThrough();
      controller = $controller('SidebarController', {$scope: scope, $rootScope: rootScope, $cookieStore: cookieStore});
      spyOn(scope, 'updateAllCategories').and.callThrough();
  }));

  describe('$scope.filterSites', function(){
  	it('should broadcast a "filter-sites" event', function(){
  		scope.filterSites('wreck', true);
  		var expectedData = {
                              category: 'wreck', 
                              show: true,
                              depthRange: [0,100]
                            } 
  		expect(rootScope.$broadcast).toHaveBeenCalledWith('event:filter-sites', expectedData);
  	});
  	it('should store filer preferences in cookie', function(){
  		scope.filterSites('wreck', true);
  		var expectedData = {
						      categories:{
						        wreck: true,
						        scenic: true,
						        drift: true
						      },
						      depthRange: [0, 100]
  						   }
  		expect(cookieStore.put).toHaveBeenCalledWith('filterPreferences', expectedData);
  	});
  });
  
  describe('$scope.formatSliderTooltip', function(){
  	it('should return the depth with "m" appended', function(){
  		expect(scope.formatSliderTooltip(10)).toBe("10m");
  	});
  });
  describe('$scope.onSlide', function(){
  	it('should update all categories', function(){
  		scope.onSlide();
  		expect(scope.updateAllCategories).toHaveBeenCalled();
  	});
  });

  describe('$scope.updateAllCategories', function(){
  	it('should broadcast a "filter-sites" event for each category', function(){
  		scope.updateAllCategories();
  		expect(rootScope.$broadcast).toHaveBeenCalledWith('event:filter-sites',jasmine.objectContaining({
  			category : 'wreck'
  		}));
  		expect(rootScope.$broadcast).toHaveBeenCalledWith('event:filter-sites',jasmine.objectContaining({
  			category : 'scenic'
  		}));
  		expect(rootScope.$broadcast).toHaveBeenCalledWith('event:filter-sites',jasmine.objectContaining({
  			category : 'drift'
  		}));
  	});
  });

  describe('On map-isready event', function(){
  	it('should update all categories', function(){
  		rootScope.$broadcast('event:map-isready');
  		expect(scope.updateAllCategories).toHaveBeenCalled();
  	});
  });
});