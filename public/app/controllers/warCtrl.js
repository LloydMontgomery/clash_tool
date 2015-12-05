// start our angular module and inject userService
angular.module('warCtrl', ['warService', 'userService'])
// user controller for the main page
// inject the War factory 
.controller('warController', function(War) {
	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;
	// grab all the wars at page load
	War.all().success(function(data) {
		// when all the wars come back, remove the processing variable
		vm.processing = false;
		// bind the wars that come back to vm.wars
		vm.wars = data;
		vm.wars.sort(function(a, b) {
			return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0;
		});
	});
})

// controller applied to War creation page
.controller('warCreateController', function($routeParams, $location, War, User) { 
	var vm = this;

	/* ========================= POPULATE HTML PAGE ========================= */

	vm.warData = {};

	vm.type = 'create';

	vm.attackOptions = [
		'Pick',
		'Hold',
		'Ask',
		'Scout',
		'Practice'
	];

	vm.sizeOptions = [	{display: '10 vs 10', value: 10},
						{display: '15 vs 15', value: 15},
						{display: '20 vs 20', value: 20},
						{display: '25 vs 25', value: 25},
						{display: '30 vs 30', value: 30},
						{display: '35 vs 35', value: 35},
						{display: '40 vs 40', value: 40},
						{display: '45 vs 45', value: 45},
						{display: '50 vs 50', value: 50}];

	// Date and Time picker for war start
	var now = new Date();
	vm.warData.start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

	/* ======================== DYNAMIC PAGE CONTROL ======================== */

	vm.setMaxStars = function() {
		vm.maxStars = Array.apply(null, Array((vm.warData.size.value*3)+1)).map(function (_, i) {return ((vm.warData.size.value*3) - i);});
		
		if (vm.warData.ourScore > (vm.warData.size.value*3))
			vm.warData.ourScore = Number(vm.warData.size.value*3);

		// If warriors are displaying, we need to adjust
		console.log(vm.warriorsReady);
		if (vm.warriorsReady)
			vm.adjustWarriorList();

	};

	vm.checkDate = function() {
		now = new Date();
		vm.warStatus = "In Progress";
		if ((now.getTime() - vm.warData.start.getTime()) > 169200000) {  // Over 47 hours since war started
			vm.warStatus = "War Over";  // Never displayed, but still the context
			vm.inProgress = false;
			vm.inProgressClass = '';
		} else if ((now.getTime() - vm.warData.start.getTime()) > 86400000) {  // Between 24 and 47 hours since beginning
			vm.warStatus = "Battle Day";
			vm.inProgressClass = 'greyedOutText';
			vm.inProgress = true;
		} else {  // Between 0 and 24 hours since beginning
			vm.warStatus = "Preparation Day";
			vm.inProgressClass = 'greyedOutText';
			vm.inProgress = true;
		}
	}; vm.checkDate();  // Self-run on load

	vm.adjustTargets = function() {
		var target;
		vm.attackOptions = [
			'Pick',
			'Hold',
			'Ask',
			'Scout',
			'Practice'
		];

		// console.log(vm.warData);
		for (var i = 0; i < vm.warData.size.value; i++) {
			target = (i + 1).toString();
			found = false;
			for (var w = 0; w < vm.warData.warriors.length; w++) {
				if (target === vm.warData.warriors[w].attack1) {
					found = true;
					break;
				}
			};
			if (!found)
				vm.attackOptions.push(target);

		};
	};

	vm.adjustUsers = function() {
		vm.warData.actUsers = [];  // Empty the array
		var found;

		for (var u = 0; u < vm.warData.users.length; u++) {
			found = false;
			for (var w = 0; w < vm.warData.warriors.length; w++) {
				if (vm.warData.warriors[w].name === vm.warData.users[u].name) {
					found = true;
					break;
				}
			};
			if (!found)
				vm.warData.actUsers.push(vm.warData.users[u].name);
		};
	};

	vm.adjustWarriorList = function() {
		console.log("adjustWarriorList");
		var change = vm.warData.size.value - vm.warData.warriors.length;
		if (change > 0) {  // Then we need to add spots
			for (var i = 0; i < change; i++) {
				vm.warData.warriors.push({
					name: 'Pick Warrior',
					attack1: 'Pick',
					attack2: 'Hold',
					lock1: false,
					lock2: false,
					stars1: 0,
					stars2: 0,
					viewed: false
				});
			};
		} else if (change < 0) { // Then we need to remove spots
			for (var i = 0; i < (-change); i++) {
				vm.warData.warriors.pop();
			};
		}  // Else it is the same as before..? Not sure this is possible, and either way it doesn't have to be handled
		vm.adjustUsers();
		vm.adjustTargets();
	};

	vm.warriorList = function () {
		vm.message = '';

		if (!vm.warData.opponent) {
			vm.message = 'Please set Opponent name';
			return;
		}
		vm.showWarriors = true;  // When the UI should show the warriors

		// Generate the warrior list templates
		vm.warData.warriors = [];
		for (var i = 0; i < vm.warData.size.value; i++) {
			vm.warData.warriors.push({
				name: 'Pick Warrior',
				attack1: 'Pick',
				attack2: 'Hold',
				lock1: false,
				lock2: false,
				stars1: 0,
				stars2: 0,
				viewed: false
			});
		};

		// call the warService function to retrieve last war
		War.last() 
			.then(function(data) {
				for (var i = 0; i < data.data.warriors.length; i++) {
					vm.warData.warriors[i] = data.data.warriors[i]
				};

				User.all() 
					.then(function(data) {
						vm.warData.users = data.data;
						vm.adjustUsers();
						vm.adjustTargets();
						vm.warriorsReady = true;
				});
				
		});
	};


	// function to save the war
	vm.saveWar = function() { 
		vm.processing = true;
		vm.message = '';
		
		// Cleanse the data before passing to the database
		var warDataCleansed = {};

		if (vm.warData.opponent == '') {
			vm.message = 'Please set Opponent name';
			return;
		}

		warDataCleansed.opponent = vm.warData.opponent;
		warDataCleansed.size = vm.warData.size.value;
		warDataCleansed.start = vm.warData.start;
		warDataCleansed.inProgress = vm.inProgress;

		if (vm.inProgress == false) {
			if (vm.warData.exp == undefined) {
				vm.message = 'Please set Exp Gained';
				return;
			}
			if (vm.warData.ourScore == undefined) {
				vm.message = 'Please set Stars for SpaceMonkeys';
				return;
			}
			if (vm.warData.theirScore == undefined) {
				vm.message = 'Please set Stars for ' + warDataCleansed.opponent;
				return;
			}
			if (vm.warData.ourDest == undefined) {
				vm.message = 'Please set Destruction for Space Monkeys';
				return;
			}
			if (vm.warData.theirDest == undefined) {
				vm.message = 'Please set Destruction for ' + warDataCleansed.opponent;
				return;
			}

			warDataCleansed.exp = vm.warData.exp;
			warDataCleansed.ourDest = vm.warData.ourDest;
			warDataCleansed.theirDest = vm.warData.theirDest;
			warDataCleansed.ourScore = Number(vm.warData.ourScore);
			warDataCleansed.theirScore = Number(vm.warData.theirScore);

			if (warDataCleansed.ourScore > warDataCleansed.theirScore)
				warDataCleansed.outcome = 'war-win';
			else if (warDataCleansed.ourScore < warDataCleansed.theirScore)
				warDataCleansed.outcome = 'war-loss';
			else if (warDataCleansed.ourDest > warDataCleansed.theirDest)
				warDataCleansed.outcome = 'war-win';
			else if (warDataCleansed.ourDest < warDataCleansed.theirDest)
				warDataCleansed.outcome = 'war-loss';
			else {
				vm.message = 'Please change Destruction of clans';
				return;
			}
		}

		for (var i = 0; i < vm.warData.warriors.length; i++) {
			if (vm.warData.warriors[i].name == 'Pick Warrior') {
				vm.message = 'Please Fill all Warrior Slots';
				return;
			}
		};
		warDataCleansed.warriors = vm.warData.warriors;

		console.log(warDataCleansed);

		// call the userService function to update
		// War.create(warDataCleansed)
		// 	.then(function(data) {
		// 		vm.processing = false; // clear the form
		// 		// bind the message from our API to vm.message
		// 		vm.message = data.data;
		// 		// $location.path('/wars');
		// });
	};

})

// controller applied to user edit page
.controller('warEditController', function($routeParams, $location, War) { 
	var vm = this;
	// variable to hide/show elements of the view // differentiates between create or edit pages 
	vm.type = 'edit';

	// get the user data for the user you want to edit // $routeParams is the way we grab data from the URL 
	War.get($routeParams.war_id)
		.success(function(data) {
			vm.warData = data;
			vm.warData.date = new Date(vm.warData.date);
	});

	vm.upload_file = function(file, signed_request, url){
		var xhr = new XMLHttpRequest();
		xhr.open("PUT", signed_request);
		xhr.setRequestHeader('x-amz-acl', 'public-read');
		xhr.onload = function() {
			if (xhr.status === 200) {
				vm.warData.img = url
				// call the userService function to update
				War.update($routeParams.war_id, vm.warData) 
					.success(function(data) {
						vm.processing = false; // clear the form
						// bind the message from our API to vm.message
						vm.message = data.message;
						$location.path('/wars');
				});
			}
		};
		xhr.onerror = function() {
			alert("Could not upload file.");
		};
		xhr.send(file);
	}

	// function to save the war
	vm.saveWar = function() { 
		vm.processing = true; 
		vm.message = '';

		if (vm.warData.file != null) {
			console.log("Saving Photo");
			War.upload(vm.warData.file)
				.then(function(data) {
					vm.processing = false;
					if (data.status == 200) {
						console.log(data.data);
						vm.upload_file(vm.warData.file, data.data.signed_request, data.data.url);
					} else {
						vm.message = 'Could not get signed URL.';
					}
			});
		}
		else {
			// call the userService function to update
			War.update($routeParams.war_id, vm.warData) 
				.success(function(data) {
					vm.processing = false; // clear the form
					// bind the message from our API to vm.message
					vm.message = data.message;
					$location.path('/wars');
			});
		}
	};
})

// controller applied to user edit page
.controller('warViewController', function($routeParams, $location, War) { 
	var vm = this;
	// variable to hide/show elements of the view // differentiates between create or edit pages 
	vm.type = 'view';

	vm.loadingPage = true;
	// get the war data for the user you want to edit // $routeParams is the way we grab data from the URL 
	War.get($routeParams.war_id)
		.success(function(data) {

			vm.warData = data;
			vm.warData.date = new Date(vm.warData.date);

			// console.log(vm.warData);
			// vm.warData.
			vm.loadingPage = false;

			now = new Date().getTime();
			myDate = new Date(2015, 10, 30, 20, 0, 0, 0).getTime();  // Current Date
			console.log(myDate);
			console.log(now);
			console.log(myDate - now);

			vm.timeRemaining = myDate;
	});

	// function to save the war
	vm.saveWar = function() { 
		// vm.processing = true; 
		vm.message = '';

		// call the userService function to update
		// War.update($routeParams.war_id, vm.warData) 
		// 	.success(function(data) {
		// 		vm.processing = false; // clear the form
		// 		// bind the message from our API to vm.message
		// 		// vm.message = data.message;
		// 		$location.path('/wars');
		// });
	};
});



