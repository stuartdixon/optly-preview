webApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/calendar', {
			templateUrl: 'views/calendar.html',
			controller: 'CalendarController'
		}).
		otherwise({
			templateUrl: 'views/homepage.html',
			controller: 'HomepageController'
		});
}]);