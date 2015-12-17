angular.module('mainCtrl', ['ui.bootstrap'])

.controller('mainController', function($rootScope, $location, Auth, User, War) {
	var vm = this;

	vm.authSizing = 'col-xs-10 col-xs-offset-1 col-sm-8 col-sm-offset-2 col-lg-4 col-lg-offset-4';
	vm.mainPageSizing = 'col-xs-12 col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3';
	vm.buttonRoutingSizing = 'col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-lg-4 col-lg-offset-4';

	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();

	var setActive = function(active) {

		if (vm.loggedIn) {
			document.getElementById('navUsers').className = '';
			document.getElementById('navWars').className = '';
		}
		document.getElementById('navHome').className = '';
		document.getElementById('navProfile').className = '';
		document.getElementById(active).className = 'active';
	}

	var checkRoutePermission = function(route) {
		if (route == '/')  // home
			setActive('navHome');
		else if (route == '/login') {
			if (vm.loggedIn){  // If a user is already logged in, don't let them go to the login page via "back"
				setActive('navHome');
				$location.path('/');
			} else {  // User is not logged in, let them go there
				setActive('navProfile');
			}
		}
		else if (route.indexOf('/wars') > -1)
			setActive('navWars');
		else {
			if (vm.userInfo && vm.userInfo.admin == true) {  // Then they have permissions to go to other pages
				if (route == '/users')
					setActive('navUsers');
			}
			else {
				setActive('navHome');
				$location.path('/');
			}
		}
	}
	
	// check to see if a user is logged in on every request
	var routeChange = function() {

		vm.loggedIn = Auth.isLoggedIn();

		// get user information on route change
		if (vm.loggedIn) {
			Auth.getUser().then(function(data) {
				vm.userInfo = data.data;
				checkRoutePermission($location.path());
			});
		} else {
			checkRoutePermission($location.path());
		}

		// Grab all users & wars if routing to main page
		if ($location.path() == '/') {
			User.partial().then(function(data) {
				if (data.data.success) {

					// bind the users that come back to vm.users
					vm.users = data.data.data;
					vm.users.sort(function(a, b) {
						return (a.dateJoined < b.dateJoined) ? -1 : (a.dateJoined > b.dateJoined) ? 1 : 0;
					});

					for (var i = 0; i < vm.users.length; i++) {
						vm.users[i].dateJoined = new Date(Number(vm.users[i].dateJoined)); // Convert milliseconds to date object
					};
					
				} else {
					// Do Something
				}
			});
			War.partial().then(function(data) {
				if (data.data.success) {

					// bind the wars that come back to vm.wars
					vm.wars = data.data.data;

					vm.wars.sort(function(a, b) {
						return (a.start.N < b.start.N) ? -1 : (a.start.N > b.start.N) ? 1 : 0;
					});

					now = new Date();
					for (var i = 0; i < vm.wars.length; i++) {
						vm.wars[i].start = new Date(Number(vm.wars[i].start.N - (now.getTimezoneOffset() * 60000))); // Convert milliseconds to date object
					};

				} else {
					// Do Something
				}
			});
		}
	};

	$rootScope.$on('$routeChangeStart', function () {
		routeChange();
	});
	
	vm.currentWar = function(start) {
		$location.path('/wars/view/' + Number(start).toString());
	}

	// function to handle login form
	vm.processAuth = function() {
		vm.processing = true;

		login = function() {
			Auth.login(vm.loginData.name, vm.loginData.password)
				.then(function(data) {
					vm.processing = false;
					// if a user successfully logs in, redirect to users page
					if (data.data.success) {
						$location.path('/');
					}
					else {
						vm.loginData.password = '';  // Clear password
						vm.loginData.passwordConfirm = '';  // Clear password
						vm.error = data.data.message;
					}
			});
		}

		// clear the error
		vm.error = '';
		vm.message = '';
		if (!vm.isRegistering) {  // Then user is trying to log in
			login();
		} else if (vm.loginData.id && vm.loginData.passwordConfirm) {
			if (vm.loginData.password != vm.loginData.passwordConfirm){
				vm.error = 'Passwords do not match';
				vm.processing = false;
			} else {  // Passwords match
				// use the create function in the userService
				User.create(vm.loginData)
					.then(function(data) {
						vm.processing = false;
						if (data.data.success) {
							vm.message = 'Registration Complete: Waiting on Admin to Approve';
							vm.loginData.password = '';  // Clear password
							vm.loginData.passwordConfirm = '';  // Clear password
							vm.processing = false;
						} else {
							vm.loginData.password = '';  // Clear password
							vm.loginData.passwordConfirm = '';  // Clear password
							vm.error = data.data.message;
							vm.processing = false;
						}	
				});
			}
		} else {  // The user has left out some piece of information
			vm.error = 'Please fill in all fields';
			vm.processing = false;
		}
	};

	// function to handle logging out
	vm.doLogout = function() {
		Auth.logout();
		vm.loggedIn = false;
		// reset all user info 
		vm.userInfo = {}; 
		$location.path('/login');
	};

});