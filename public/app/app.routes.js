// inject ngRoute for all our routing needs
// configure our routes
angular.module('app.routes', ['ngRoute']) 
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// home page route
	.when('/', {
		templateUrl : 'app/views/pages/home.html',
		css			: 'assets/css/home.css'
	})
	// splash page
	.when('/splash', {
		templateUrl : 'app/views/pages/splash.html',
		css			: 'assets/css/splash.css'
	})
	// splash page
	.when('/about', {
		templateUrl : 'app/views/pages/about.html',
		css			: 'assets/css/about.css'
	})
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
		css			: 'assets/css/wars/all-wars.css',
		controller	: 'warListController',
		controllerAs: 'vm'
	})
	// The current war
	.when('/wars/current', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'vm'
	})
	// form to create a new war // same view as edit page 
	.when('/wars/create', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'vm'
	})
	//page to edit a war
	.when('/wars/edit/:war_id', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'vm'
	})
	//page to view a war
	.when('/wars/view/:war_id', {
		templateUrl	: 'app/views/pages/wars/single.html',
		css			: 'assets/css/war.css',
		controller	: 'warManipulationController',
		controllerAs: 'vm'
	})

	// CLAN //
	// View a Clan
	.when('/@/:clan_ref', {
		templateUrl : 'app/views/pages/home.html',
		css			: 'assets/css/home.css'
	})
	// Register a Clan
	.when('/clans/register', {
		templateUrl	: 'app/views/pages/clans/register.html',
		css			: 'assets/css/clans/register.css',
		controller	: 'clanRegisterController',
		controllerAs: 'clan'
	})
	// Join a Clan
	.when('/clans/join', {
		templateUrl	: 'app/views/pages/clans/join.html',
		css			: 'assets/css/clans/join.css',
		controller	: 'clanJoinController',
		controllerAs: 'clan'
	})// Join a Clan
	.when('/clan/manage', {
		templateUrl	: 'app/views/pages/clans/manage.html',
		css			: 'assets/css/clans/manage.css',
		controller	: 'clanManageController',
		controllerAs: 'clan'
	})
	// Catch-All, send them to the splash page
	.otherwise({
		redirectTo: '/splash'
	});
	// get rid of the hash in the URL
	$locationProvider.html5Mode(true);
});