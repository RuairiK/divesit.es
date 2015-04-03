describe('roundDepth filter', function() {
	var filter;
	beforeEach(function() {
		module('divesitesApp');
		inject(function($filter) {
			filter = $filter;
		});
	});
	it('should round depth to the nearest single decimal point', function() {
		var roundDepth = filter('roundDepth');
		expect(roundDepth(5.54)).toEqual(5.5);
		expect(roundDepth(9.99)).toEqual(10);
		expect(roundDepth(5.56)).toEqual(5.6);
	})
})