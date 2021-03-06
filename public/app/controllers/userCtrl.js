// start our angular module and inject userFactory
angular.module('userCtrl', ['userFactory', 'chart.js'])
// user controller for the main page
// inject the User factory 
.controller('userController', function($location, User) {
	var vm = this;
	vm.message = '';
	vm.filter = '0';

	vm.users = [
		{
			name: 'DevilDog9597',
			th: '11',
			bk: '40',
			aq: '40',
			gw: '11'
		},
		{
			name: 'Ned Kelly',
			th: '11',
			bk: '22',
			aq: '21',
			gw: '2'
		},
		{
			name: 'Imperial',
			th: '10',
			bk: '21',
			aq: '20',
			gw: '0'
		},
		{
			name: 'ཬད༼ Zephyro ༽ཌར',
			th: '9',
			bk: '20',
			aq: '20',
			gw: '0'
		},
		{
			name: 'Tensa Zangetsu',
			th: '9',
			bk: '15',
			aq: '14',
			gw: '0'
		},
		{
			name: 'Zephyro',
			th: '8',
			bk: '8',
			aq: '0',
			gw: '0'
		},
		{
			name: 'NOBLE 3',
			th: '9',
			bk: '10',
			aq: '9',
			gw: '0'
		},
		{
			name: '~Big Dog~',
			th: '8',
			bk: '8',
			aq: '0',
			gw: '0'
		},
		{
			name: 'Sir Lancelot',
			th: '8',
			bk: '5',
			aq: '0',
			gw: '0'
		}
	]

	// set a processing variable to show loading things
	vm.processing = true;
	// grab all the users at page load

	User.all()
	.then(function(data) {
		console.log(data.data.data);
		vm.processing = false;
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

	vm.profile = function (person) {
		$location.path('/users/profile/' + person.name);
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
		// use the create function in the userFactory
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
		// call the userFactory function to update
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

		if (!vm.profile.thLvl || (vm.profile.kingLvl === null)  || (vm.profile.queenLvl === null)) {
			vm.error = 'Missing Town Hall, Barb King, or Queen Information'
			vm.updating = false;
			return;
		}

		vm.setHeroesCountdowns();

		updateData = {
			'username': vm.profile.username,
			'thLvl': vm.profile.thLvl,
			'kingLvl': vm.profile.kingLvl,
			'queenLvl': vm.profile.queenLvl,
			'kingFinishDate': vm.profile.kingFinishDate,
			'queenFinishDate': vm.profile.queenFinishDate
		};

		User.setProfile(vm.profile.username, updateData)
		.then(function(data) {
			if (data.data.success)
				vm.message = 'Successfully Updated Profile'
			else
				vm.error = data.data.message;
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




