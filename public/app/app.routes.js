// inject ngRoute for all our routing needs
// configure our routes
angular.module('app.routes', ['ngRoute']) 
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// home page route
	.when('/', {
		templateUrl : 'app/views/pages/home.html'
	})
	// login page
	.when('/login', {
		templateUrl : 'app/views/pages/login.html',
		controller  : 'mainController',
		controllerAs: 'auth'
	})

	// USERS //
	// show all users
	.when('/users', {
		templateUrl	: 'app/views/pages/users/all.html',
		controller	: 'userController',
		controllerAs: 'user'
	})
	// form to create a new user // same view as edit page 
	.when('/users/create', {
		templateUrl	: 'app/views/pages/users/single.html',
		controller	: 'userCreateController',
		controllerAs: 'user'
	})
	//page to edit a user
	.when('/users/:user_id', {
		templateUrl	: 'app/views/pages/users/single.html',
		controller	: 'userEditController',
		controllerAs: 'user'
	})

	// WARS //
	// show all users
	.when('/wars', {
		templateUrl	: 'app/views/pages/wars/all.html',
		controller	: 'warController',
		controllerAs: 'war'
	})
	// form to create a new user // same view as edit page 
	.when('/wars/create', {
		templateUrl	: 'app/views/pages/wars/single1.html',
		controller	: 'warCreateController',
		controllerAs: 'war'
	})
	//page to edit a user
	.when('/wars/:war_id', {
		templateUrl	: 'app/views/pages/wars/single1.html',
		controller	: 'warEditController',
		controllerAs: 'war'
	});
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});