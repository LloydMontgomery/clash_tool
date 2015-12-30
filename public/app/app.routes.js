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
		controllerAs: 'auth',
		css: 'assets/css/login.css'
	})

	// USERS //
	// show all users
	.when('/users', {
		templateUrl	: 'app/views/pages/users/all.html',
		controller	: 'userController',
		controllerAs: 'user',
		css: 'assets/css/user.css'
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
	//page to view a user profile
	.when('/users/profile/:user_id', {
		templateUrl	: 'app/views/pages/users/profile.html',
		controller	: 'userProfileController',
		controllerAs: 'user',
		css: 'assets/css/user.css'
	})

	// WARS //
	// show all wars
	.when('/wars', {
		templateUrl	: 'app/views/pages/wars/all.html',
		controller	: 'warListController',
		controllerAs: 'war'
	})

	// The current war
	.when('/wars/current', {
		templateUrl	: 'app/views/pages/wars/single.html',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	})
	// form to create a new war // same view as edit page 
	.when('/wars/create', {
		templateUrl	: 'app/views/pages/wars/single.html',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	})
	//page to edit a war
	.when('/wars/edit/:war_id', {
		templateUrl	: 'app/views/pages/wars/single.html',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	})
	//page to view a war
	.when('/wars/view/:war_id', {
		templateUrl	: 'app/views/pages/wars/single.html',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	});
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});