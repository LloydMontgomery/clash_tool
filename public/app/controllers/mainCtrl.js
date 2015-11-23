angular.module('mainCtrl', ['ui.bootstrap'])

.controller('mainController', function($rootScope, $location, Auth, User, War) {
	var vm = this;

	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();
	
	// check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function() {

		vm.loggedIn = Auth.isLoggedIn();

		// get user information on route change
		if (vm.loggedIn) {
			Auth.getUser().then(function(data) {
				vm.user = data.data.name;
			});
		}

		// Grab all users & wars if routing to main page
		if ($location.path() == '/') {
			User.all().success(function(data) {
				// bind the users that come back to vm.users
				vm.users = data;
				vm.users.sort(function(a, b) {
					return (a.date < b.date) ? -1 : (a.date > b.date) ? 1 : 0;
				});
			});
			War.all().success(function(data) {
				// bind the users that come back to vm.users
				vm.wars = data;
				vm.wars.sort(function(a, b) {
					return (a.date < b.date) ? -1 : (a.date > b.date) ? 1 : 0;
				});
			});
		}
	});


	// function to handle login form
	vm.processAuth = function() {
		vm.processing = true;

		login = function() {
			Auth.login(vm.loginData.name, vm.loginData.password)
				.then(function(data) {
					vm.processing = false;
					// if a user successfully logs in, redirect to users page
					if (data.data.success) {
						$location.path('/users');
					}
					else {
						vm.loginData.password = '';  // Clear password
						vm.loginData.passwordConfirm = '';  // Clear password
						vm.error = 'ID or password incorrect';
					}
			});
		}

		// clear the error
		vm.error = '';
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
							login();
						} else {
							vm.processing = false;
							vm.loginData.password = '';  // Clear password
							vm.loginData.passwordConfirm = '';  // Clear password
							vm.error = data.data.message;
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
		// reset all user info 
		vm.user = {}; 
		$location.path('/login');
	};

});