// start our angular module and inject userService
angular.module('userCtrl', ['userService', 'chart.js'])
// user controller for the main page
// inject the User factory 
.controller('userController', function(User) {
	var vm = this;
	vm.message = '';
	vm.filter = '0';

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

			vm.inClan = [];
			vm.notInClan = [];
			vm.admins = [];

			for (var i = 0; i < vm.users.length; i++) {
				if (vm.users[i].inClan)
					vm.inClan.push(vm.users[i]);
				else
					vm.notInClan.push(vm.users[i]);
				if (vm.users[i].admin)
					vm.admins.push(vm.users[i]);
			};
			vm.displayUsers = vm.inClan;

			vm.processing = false;
		} else {
			vm.message = 'Database Error. Try again another time.'
			vm.processing = false;
		}
	});

	vm.filterList = function () {
		if (vm.filter == '0')
			vm.displayUsers = vm.inClan;
		else if (vm.filter == '1')
			vm.displayUsers = vm.notInClan;
		else
			vm.displayUsers = vm.admins;
	};

	// function to delete a user
	vm.deleteUser = function (name) {
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

.controller('userProfileController', function($scope, $routeParams, $uibModal, User) {
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

		for (var i = maxKingLvl; i >= 0; i--) { vm.kingLvls.push(i) };
		for (var i = maxQueenLvl; i >= 0; i--) { vm.queenLvls.push(i) };
	}

	/* ========================= LOGIC PAGE CONTROL ========================= */

	vm.calculateStats = function () {
		$scope.stars = [[0, 0, 0, 0]];
		vm.profile.warsFought = vm.profile.wars.length / 2;
		vm.profile.attacksMade = vm.profile.wars.length;
		vm.profile.threeStarRate = 0;
		vm.profile.starsGained = 0;

		for (var i = 0; i < vm.profile.wars.length; i++) {
			stars = Number(vm.profile.wars[i].stars);
			$scope.stars[0][stars] += 1;
			vm.profile.starsGained += stars;
			if (stars == 3)
				vm.profile.threeStarRate += 1;
		};
		vm.profile.threeStarRate = ((vm.profile.threeStarRate / vm.profile.attacksMade) * 100);
	}

	vm.updateProfile = function() {
		vm.error = '';
		vm.message = '';
		vm.updating = true;

		console.log(vm.profile);
		if (!vm.profile.thLvl || !vm.profile.kingLvl || !vm.profile.queenLvl) {
			vm.error = 'Missing Town Hall, Barb King, or Queen Information'
			vm.updating = false;
			return;
		}

		vm.setHeroesCountdowns();

		updateData = {
			'name': vm.profile.name,
			'thLvl': vm.profile.thLvl,
			'kingLvl': vm.profile.kingLvl,
			'queenLvl': vm.profile.queenLvl,
			'kingFinishDate': vm.profile.kingFinishDate,
			'queenFinishDate': vm.profile.queenFinishDate
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


	/* ============================ MODAL LOGIC ============================ */

	vm.options = {};
	vm.options.kingTimeDays = [];
	vm.options.kingTimeHours = [];
	vm.options.kingTimeMinutes = [];

	vm.options.queenTimeDays = [];
	vm.options.queenTimeHours = [];
	vm.options.queenTimeMinutes = [];

	vm.initVars = function () {
		vm.options.queenTimeDays = [0, 1, 2, 3, 4, 5, 6, 7];
		for (var i = 0; i < 24; i++) { vm.options.queenTimeHours.push(i) };
		for (var i = 0; i < 60; i++) { vm.options.queenTimeMinutes.push(i) };

		vm.options.kingTimeDays = [0, 1, 2, 3, 4, 5, 6, 7];
		for (var i = 0; i < 24; i++) { vm.options.kingTimeHours.push(i) };
		for (var i = 0; i < 60; i++) { vm.options.kingTimeMinutes.push(i) };
	}; vm.initVars();

	vm.setBarbUpgradeTime = function () {
		// Set the maximum Day and select the right hours (12 or 0)
		kingLvl = vm.profile.kingLvl;
		if (kingLvl > 14)
			kingLvl = 14;
		vm.profile.kingTimeDay = Math.floor(kingLvl * .5);
		vm.profile.kingTimeHour = (kingLvl * 12) % 24;
		vm.profile.kingTimeMinute = 0;

		vm.options.kingTimeDays = [];
		for (var i = 0; i <= vm.profile.kingTimeDay; i++) { vm.options.kingTimeDays.push(i) };
	}

	vm.setQueenUpgradeTime = function () {
		queenLvl = vm.profile.queenLvl;
		if (queenLvl > 14)
			queenLvl = 14;
		vm.profile.queenTimeDay = Math.floor(queenLvl * .5);
		vm.profile.queenTimeHour = (queenLvl * 12) % 24;
		vm.profile.queenTimeMinute = 0;

		vm.options.queenTimeDays = [];
		for (var i = 0; i <= vm.profile.queenTimeDay; i++) { vm.options.queenTimeDays.push(i) };
	}

	vm.setHeroesCountdowns = function () {
		if (!vm.kingTimerDisable) {
			// Add the time together
			var minutesAway = (vm.profile.kingTimeDay * 24 * 60) + (vm.profile.kingTimeHour * 60) + vm.profile.kingTimeMinute;
			
			// Get the current time and offset it by the timer length
			now = new Date();
			now = now.getTime();
			vm.profile.kingFinishDate = now + (minutesAway * 60 * 1000);
		} else {
			vm.profile.kingFinishDate = 0;
		}

		console.log(vm.profile.kingFinishDate);

		if (!vm.queenTimerDisable) {
			// Add the time together
			var minutesAway = (vm.profile.queenTimeDay * 24 * 60) + (vm.profile.queenTimeHour * 60) + vm.profile.queenTimeMinute;
			
			// Get the current time and offset it by the timer length
			now = new Date();
			now = now.getTime();
			vm.profile.queenFinishDate = now + (minutesAway * 60 * 1000);
		} else {
			vm.profile.queenFinishDate = 0;
		}
	}

	vm.open = function (size) {
		vm.updating = true;

		if (vm.initial.kingFinishDate == 0)
			vm.kingTimer = false;
		if (vm.initial.queenFinishDate == 0)
			vm.queenTimer = false;

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: size,
			resolve: {
				user: function () {
					return vm;
				}
			}
		});

		modalInstance.result.then(function (user) {
			vm.updating = false;
			vm.updateProfile()
		}, function () {
			vm.updating = false;
			vm.updateProfile()
		});
	};

	/* =================== AUTO-RUN CODE FOR LOADING PAGE =================== */

	// get the user data for the user you want to edit 
	// $routeParams is the way we grab data from the URL 
	User.getProfile($routeParams.user_id)
	.then(function(data) {
		if (data.data.success) {
			vm.profile = data.data.data;

			// Save some initial values so we know if they change when writing back
			vm.initial = {};
			vm.initial.kingFinishDate = vm.profile.kingFinishDate;
			vm.initial.queenFinishDate = vm.profile.queenFinishDate;

			console.log(vm.profile);

			vm.calculateStats();
			vm.setMaxLvls();
			if (vm.initial.kingFinishDate == 0) {
				vm.kingTimerDisable = true;
				vm.setBarbUpgradeTime();
			}
			if (vm.initial.queenFinishDate == 0) {
				vm.queenTimerDisable = true;
				vm.setQueenUpgradeTime();
			}
		} else {
			vm.message = data.data.message;
		}
		vm.loadingPage = false;
	});



})

.controller('ModalInstanceCtrl', function($scope, $uibModalInstance, user) {

	$scope.user = user;

	$scope.ok = function () {
		$uibModalInstance.close($scope.user);
	};
});




