angular.module('authCtrl', [])

.controller('authController', function($rootScope, $location, Auth) {
	var vm = this;
	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();

	// function to handle login form
	vm.processAuth = function() {
		vm.processing = true;

		// clear the error
		vm.error = '';

		if (!vm.isRegistering) {  // Then user is trying to log in
			console.log("Logging In");
			Auth.login(vm.loginData.id, vm.loginData.pwd)
				.then(function(data) {
					vm.processing = false;
					// if a user successfully logs in, redirect to users page
					if (data.data.success) 
						$location.path('/users');
					else {
						vm.loginData.password = '';  // Clear password
						vm.error = 'ID or password incorrect';
					}
				});
		} else if (vm.isRegistering && vm.loginData.id && vm.loginData.pwdConfirm) {
			console.log("Registering");
			if (vm.loginData.pwd != vm.loginData.pwdConfirm){
				vm.error = 'Passwords do not match';
				vm.processing = false;
			} else {  // Passwords match
				console.log("Successfully Registered");
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