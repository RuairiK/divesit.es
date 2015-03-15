describe('NavTopController', function() {
  beforeEach(module('divesitesApp'));

  var scope, controller, modal;
  beforeEach(inject(function ($rootScope, $controller) {
      //set up a new scope and the controller for the test
      scope = $rootScope.$new();
      //Create spy object
      modal = jasmine.createSpyObj('modal', ['open', 'hide']);
      //provide modal as dependency to the controller.
      controller = $controller('NavTopController', {$scope: scope, $modal:modal});

  }));

  it('should open the "about" modal', function () {
      scope.showAbout();
      expect(modal.open).toHaveBeenCalledWith({ templateUrl: 'views/partials/about.html' });
  });
  it('should open the "contact" modal', function () {
      scope.showContact();
      expect(modal.open).toHaveBeenCalledWith({ templateUrl: 'views/partials/contact.html' });
  });
  it('should open the "addSite" modal', function () {
      scope.showSubmission();
      expect(modal.open).toHaveBeenCalledWith({
          templateUrl: 'views/partials/add-site.html',
          controller: 'AddSiteController'
        });
  });
});