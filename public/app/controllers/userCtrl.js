// start our angular module and inject userService
angular.module('userCtrl', ['userService'])
// user controller for the main page
// inject the User factory 
.controller('userController', function(User) {
	var vm = this;
	vm.message = '';

	// set a processing variable to show loading things
	vm.processing = true;
	// grab all the users at page load
	User.all().then(function(data) {
		if (data.data.success) {

			// bind the users that come back to vm.users
			vm.users = data.data.data;
			vm.users.sort(function(a, b) {
				return (a.name.S < b.name.S) ? -1 : (a.name.S > b.name.S) ? 1 : 0;
			});
			vm.processing = false;

		} else {
			vm.message = 'Database Error. Try again another time.'
			vm.processing = false;
		}
	});

	// function to delete a user
	vm.deleteUser = function(id) {
		vm.processing = true;
		// accepts the user id as a parameter
		User.delete(id).success(function(data) {
			// get all users to update the table
			// you can also set up your api
			// to return the list of users with the delete call 
			User.all()
				.success(function(data) { 
					vm.processing = false; 
					vm.users = data;
				});
		}); 
	};
})

// controller applied to user creation page
.controller('userCreateController', function($location, User) { 
	var vm = this;
	// variable to hide/show elements of the view // differentiates between create or edit pages 
	vm.type = 'create';

	vm.userData = {};
	vm.userData.approved = true;
	vm.userData.inClan = true;
	vm.userData.admin = false;
	vm.userData.title = 'Member';

	// function to create a user
	vm.saveUser = function() {
		vm.processing = true;

		if (!vm.userData.password){
			vm.message = 'Please Enter a Password';
			vm.processing = false;
			return;
		}
		// clear the message
		vm.message = '';
		// use the create function in the userService
		User.create(vm.userData) 
			.then(function(data) {
				vm.processing = false;
				if (data.data.success)
					$location.path('/users');  // Switch back to Users
				else {
					vm.userData.password = '';
					vm.message = data.data.message;
				}
		});
	}; 
})

// controller applied to user edit page
.controller('userEditController', function($routeParams, $location, User) { 
	var vm = this;
	// variable to hide/show elements of the view // differentiates between create or edit pages 
	vm.type = 'edit';
	// get the user data for the user you want to edit // $routeParams is the way we grab data from the URL 
	User.get($routeParams.user_id)
		.success(function(data) {
			vm.userData = data;
	});
	// function to save the user
	vm.saveUser = function() { 
		vm.processing = true; 
		vm.message = '';
		// call the userService function to update
		User.update($routeParams.user_id, vm.userData) 
			.then(function(data) {
				vm.processing = false;
				if (data.data.success)
					$location.path('/users');  // Switch back to Users
				else {
					vm.userData.password = '';
					vm.message = data.data.message;
				}
		});
	};
});




