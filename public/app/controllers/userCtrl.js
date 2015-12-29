// start our angular module and inject userService
angular.module('userCtrl', ['userService', 'chart.js'])
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
				return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
			});
			vm.processing = false;

		} else {
			vm.message = 'Database Error. Try again another time.'
			vm.processing = false;
		}
	});

	// function to delete a user
	vm.deleteUser = function(name) {
		console.log(name);
		vm.processing = true;

		User.delete(name).success(function(data) {
			User.all()
				.then(function(data) {
					vm.users = data.data.data;
					vm.users.sort(function(a, b) {
						return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
					});
					vm.processing = false;
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
	vm.processing = true;
	// get the user data for the user you want to edit // $routeParams is the way we grab data from the URL 
	User.get($routeParams.user_id)
		.then(function(data) {
			if (data.data.success) {
				vm.userData = data.data.data;
				vm.processing = false;
			} else {
				vm.message = data.data.message;
			}
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
})

.controller('userProfileController', function($scope, $routeParams, User) {
	var vm = this;

	/* ========================= POPULATE HTML PAGE ========================= */
	vm.loadingPage = true;

	vm.thLvls = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
	vm.kingLvls = [];
	vm.queenLvls = [];

	// Data for the Graph
	$scope.stars = [[0, 0, 0, 0]];
	$scope.labels = ['0', '1', '2', '3'];

	/* ======================== DYNAMIC PAGE CONTROL ======================== */

	vm.setMaxLvls = function () {
		vm.kingLvls = [];
		vm.queenLvls = [];
		var maxKingLvl = 0;
		var maxQueenLvl = 0;
		if (vm.profile.thLvl == 7) {
			maxKingLvl = 5;
			maxQueenLvl = 0;
		} else if (vm.profile.thLvl == 8 ) {
			maxKingLvl = 10;
			maxQueenLvl = 0;
		} else if (vm.profile.thLvl == 9 ) {
			maxKingLvl = 30;
			maxQueenLvl = 30;
		} else if (vm.profile.thLvl == 10 ) {
			maxKingLvl = 40;
			maxQueenLvl = 40;
		} else if (vm.profile.thLvl == 11 ) {
			maxKingLvl = 40;
			maxQueenLvl = 40;
		}

		for (var i = maxKingLvl; i > 0; i--) { vm.kingLvls.push(i) };
		for (var i = maxQueenLvl; i > 0; i--) { vm.queenLvls.push(i) };
	}

	/* ========================= LOGIC PAGE CONTROL ========================= */

	vm.calculateStats = function () {
		$scope.stars = [[0, 0, 0, 0]];
		vm.profile.warsFought = vm.profile.wars.length;
		vm.profile.attacksMade = (vm.profile.wars.length * 2);
		vm.profile.threeStarRate = 0;
		vm.profile.starsGained = 0;
		for (var i = 0; i < vm.profile.wars.length; i++) {
			stars1 = Number(vm.profile.wars[i].attack1.stars);
			stars2 = Number(vm.profile.wars[i].attack2.stars);
			$scope.stars[0][stars1] += 1;
			$scope.stars[0][stars2] += 1;
			vm.profile.starsGained += stars1;
			vm.profile.starsGained += stars2;
			if (stars1 == 3)
				vm.profile.threeStarRate += 1;
			if (stars2 == 3)
				vm.profile.threeStarRate += 1;
		};
		vm.profile.threeStarRate = ((vm.profile.threeStarRate / vm.profile.attacksMade) * 100);
	}

	vm.updateProfile = function() {
		vm.error = '';
		vm.message = '';
		vm.updating = true;

		console.log(vm.profile);
		if (!vm.profile.thLvl || !vm.profile.barbLvl || !vm.profile.queenLvl) {
			vm.error = 'Missing Town Hall, Barb King, or Queen Information'
			vm.updating = false;
			return;
		}

		updateData = {
			'name': vm.profile.name,
			'thLvl': vm.profile.thLvl,
			'barbLvl': vm.profile.barbLvl,
			'queenLvl': vm.profile.queenLvl,
		};

		User.setProfile(vm.profile.name, updateData)
		.then(function(data) {
			if (data.data.success) {
				vm.message = 'Successfully Updated Profile'
			} else {
				vm.error = data.data.message;
			}
			vm.updating = false;
		});
	}

	vm.loadingPage = true;
	// get the user data for the user you want to edit 
	// $routeParams is the way we grab data from the URL 
	User.getProfile($routeParams.user_id)
	.then(function(data) {
		if (data.data.success) {
			vm.profile = data.data.data;
			console.log(vm.profile);
			vm.calculateStats();
			vm.setMaxLvls();
		} else {
			vm.message = data.data.message;
		}
		vm.loadingPage = false;
	});


});




