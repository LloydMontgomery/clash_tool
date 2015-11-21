angular.module('authCtrl', [])

.controller('authController', function($rootScope, $location, Auth, User) {
	var vm = this;
	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();

	// function to handle login form
	vm.processAuth = function() {
		vm.processing = true;

		// clear the error
		vm.error = '';
		if (!vm.isRegistering) {  // Then user is trying to log in
			Auth.login(vm.loginData.name, vm.loginData.password)
				.then(function(data) {
					vm.processing = false;
					// if a user successfully logs in, redirect to users page
					if (data.data.success) 
						$location.path('/users');
					else {
						vm.loginData.password = '';  // Clear password
						// vm.error = 'ID or password incorrect';
						vm.error = data.data.message;
					}
				});
		} else if (vm.loginData.id && vm.loginData.passwordConfirm) {
			if (vm.loginData.password != vm.loginData.passwordConfirm){
				vm.error = 'Passwords do not match';
				vm.processing = false;
			} else {  // Passwords match
				// use the create function in the userService
				User.create(vm.loginData) 
					.then(function(data) {
						vm.processing = false;
						console.log(data.data);
						if (data.data.success) {
							console.log(vm.loginData);
							Auth.login(vm.loginData.name, vm.loginData.password)
								.then(function(data) {
									console.log(data);
									vm.processing = false;
									// if a user successfully logs in, redirect to users page
									if (data.data.success) 
										$location.path('/users');
									else {
										console.log("HERE");
										vm.loginData.password = '';  // Clear password
										vm.loginData.passwordConfirm = '';  // Clear password
										vm.error = data.data.message;
									}
							});
						} else {
							console.log("HERE AGAIN");
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