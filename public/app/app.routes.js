// inject ngRoute for all our routing needs
// configure our routes
angular.module('app.routes', ['ngRoute']) 
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// home page route
	.when('/', {
		templateUrl : 'app/views/pages/splash.html',
		css			: 'assets/css/splash.css'
	})
	// .when('/', {
	// 	templateUrl : 'app/views/pages/home.html',
	// 	css			: 'assets/css/home.css'
	// })
	// login page
	.when('/login', {
		templateUrl : 'app/views/pages/login.html',
		css			: 'assets/css/login.css',
		controller  : 'mainController',
		controllerAs: 'auth'
	})

	// USERS //
	// show all users
	.when('/users', {
		templateUrl	: 'app/views/pages/users/all.html',
		css			: 'assets/css/users/user.css',
		controller	: 'userController',
		controllerAs: 'user'
	})
	// form to create a new user // same view as edit page 
	.when('/users/create', {
		templateUrl	: 'app/views/pages/users/single.html',
		css			: 'assets/css/users/user.css',
		controller	: 'userCreateController',
		controllerAs: 'user'
	})
	//page to edit a user
	.when('/users/:user_id', {
		templateUrl	: 'app/views/pages/users/single.html',
		css			: 'assets/css/users/user.css',
		controller	: 'userEditController',
		controllerAs: 'user'
	})
	//page to view a user profile
	.when('/users/profile/:user_id', {
		templateUrl	: 'app/views/pages/users/profile.html',
		css			: 'assets/css/users/profile.css',
		controller	: 'userProfileController',
		controllerAs: 'user'
	})

	// WARS //
	// show all wars
	.when('/wars', {
		templateUrl	: 'app/views/pages/wars/all.html',
		css			: 'assets/css/war.css',
		controller	: 'warListController',
		controllerAs: 'war'
	})
	// The current war
	.when('/wars/current', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	})
	// form to create a new war // same view as edit page 
	.when('/wars/create', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	})
	//page to edit a war
	.when('/wars/edit/:war_id', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	})
	//page to view a war
	.when('/wars/view/:war_id', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'war'
	});
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});