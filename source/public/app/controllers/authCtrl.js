angular.module('authCtrl', [])

.controller('authController', function($rootScope, $location, Auth) {
	var vm = this;
	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();

	// function to handle login form
	vm.doLogin = function() {
		vm.processing = true;

		// clear the error
		vm.error = '';

		Auth.login(vm.loginData.username, vm.loginData.password)
			.then(function(data) {
				vm.processing = false;
				// if a user successfully logs in, redirect to users page
				if (data.data.success) 
					$location.path('/users');
				else {
					vm.loginData.password = '';  // Clear password
					vm.error = 'Username or password incorrect.';
				}
			});
	};

	// function to handle logging out
	vm.doLogout = function() { 
		Auth.logout();
		// reset all user info 
		vm.user = {}; 
		$location.path('/login');
	};
});