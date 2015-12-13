// start our angular module and inject userService
angular.module('warCtrl', ['warService', 'userService'])
// user controller for the main page
// inject the War factory 
.controller('warListController', function(War, $location) {
	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;
	// grab all the wars at page load
	War.all().then(function(data) {
		
		// bind the wars that come back to vm.wars
		vm.wars = data.data.data;
		vm.wars.sort(function(a, b) {
			return (a.start.N < b.start.N) ? 1 : (a.start.N > b.start.N) ? -1 : 0;
		});

		now = new Date();
		for (var i = 0; i < vm.wars.length; i++) {
			vm.wars[i].start = new Date(Number(vm.wars[i].start.N - (now.getTimezoneOffset() * 60000))); // Convert milliseconds to date object
		};

		// when all the wars come back, remove the processing variable
		vm.processing = false;
	});

	vm.viewWar = function(start) {
		$location.path('/wars/view/' + (Number(start) + (now.getTimezoneOffset() * 60000)).toString());
	}

	vm.editWar = function(start) {
		$location.path('/wars/edit/' + (Number(start) + (now.getTimezoneOffset() * 60000)).toString());
	}
})

// controller applied to War creation page
.controller('warManipulationController', function($route, $routeParams, $location, Auth, War, User) { 
	var vm = this;
	vm.loadingPage = true;

	/* ========================= POPULATE HTML PAGE ========================= */

	vm.warData = {};

	vm.attackClass = 'col-xs-6';
	vm.nameClass = 'col-xs-6';
	if ($location.path() == '/wars/current') {
		vm.type = 'view';
	}
	else if ($location.path() == '/wars/create')
		vm.type = 'create';
	else if ($location.path().substr(0, 11) == '/wars/edit/') // Edit page
		vm.type = 'edit';
	else if ($location.path().substr(0, 11) == '/wars/view/') { // view page
		vm.type = 'view';
		vm.attackClass = 'col-xs-6';
		vm.nameClass = 'col-xs-12';
	}


	vm.command = 'Move';
	vm.commandOptions = [
		'Move',
		'^ 3',
		'^ 2',
		'^ 1',
		' X ',
		'v 1',
		'v 2',
		'v 3'
	];

	vm.attackOptions = [];

	vm.warData.size = 10;
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
	vm.warData.startDisplay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
	vm.warData.start = vm.warData.startDisplay.getTime();

	/* ======================== DYNAMIC PAGE CONTROL ======================== */

	vm.setMaxStars = function() {
		vm.maxStars = Array.apply(null, Array((vm.warData.size*3)+1)).map(function (_, i) {return ((vm.warData.size*3) - i);});
		if (vm.warData.ourScore > (vm.warData.size*3))
			vm.warData.ourScore = Number(vm.warData.size*3);

		// If warriors are displaying, we need to adjust
		if (vm.warriorsReady)
			vm.adjustWarriorList();
	};

	vm.setStars = function(auto, warrior, stars, option) {
		if (auto || vm.type == 'edit') {
			if (stars == 1) {  // Then this is stars1
				if (option == '0') {  // User has selected the first star
					warrior.stars1 = '0'
					warrior.s1Opt1 = warrior.s1Opt2 = warrior.s1Opt3 = 'glyphicons-star-empty';
				} else if (option == '1') {
					warrior.stars1 = '1'
					warrior.s1Opt1 = 'glyphicons-star';
					warrior.s1Opt2 = warrior.s1Opt3 = 'glyphicons-star-empty';
				} else if (option == '2') {
					warrior.stars1 = '2'
					warrior.s1Opt1 = warrior.s1Opt2 = 'glyphicons-star';
					warrior.s1Opt3 = 'glyphicons-star-empty';
				} else {  // option == '3'
					warrior.stars1 = '3'
					warrior.s1Opt1 = warrior.s1Opt2 = warrior.s1Opt3 = 'glyphicons-star';
				}
			} else {  // This is stars2
				if (option == '0') {  // User has selected the first star
					warrior.stars2 = '0'
					warrior.s2Opt1 = warrior.s2Opt2 = warrior.s2Opt3 = 'glyphicons-star-empty';
				} else if (option == '1') {
					warrior.stars2 = '1'
					warrior.s2Opt1 = 'glyphicons-star';
					warrior.s2Opt2 = warrior.s2Opt3 = 'glyphicons-star-empty';
				} else if (option == '2') {
					warrior.stars2 = '2'
					warrior.s2Opt1 = warrior.s2Opt2 = 'glyphicons-star';
					warrior.s2Opt3 = 'glyphicons-star-empty';
				} else {  // option == '3'
					warrior.stars2 = '3'
					warrior.s2Opt1 = warrior.s2Opt2 = warrior.s2Opt3 = 'glyphicons-star';
				}
			}
		}
	}

	vm.checkDate = function() {
		vm.warData.start = vm.warData.startDisplay.getTime();

		vm.battleCountdown = vm.warData.start + 169200000;  		// Add 47 Hours
		vm.preparationCountdown = vm.warData.start + 82800000;  	// Add 23 Hours

		now = new Date();
		var timeSinceStart = (now.getTime() - vm.warData.start)
		if (timeSinceStart > 169200000) {  // Over 47 hours since war started
			vm.warStatus = 'War Over';  // Never displayed, but still the context
			vm.warData.inProgress = false;
			vm.attackClass = 'col-xs-12';
			vm.warStatsSubContainer = 'col-sm-4 col-xs-12';
			vm.inProgressClass = '';
		} else if (timeSinceStart > 82800000) {  // Between 23 and 47 hours since beginning
			vm.warStatus = 'Battle Day';
			vm.inProgressClass = 'greyedOutText';
			if (vm.type == 'view')
				vm.warStatsSubContainer = 'col-sm-offset-2 col-sm-4 col-xs-12';
			else
				vm.warStatsSubContainer = 'col-sm-4 col-xs-12';
			vm.warData.inProgress = true;
		} else {  // Between 0 and 23 hours since beginning
			vm.warStatus = 'Preparation Day';
			vm.inProgressClass = 'greyedOutText';
			if (vm.type == 'view')
				vm.warStatsSubContainer = 'col-sm-offset-2 col-sm-4 col-xs-12';
			else
				vm.warStatsSubContainer = 'col-sm-4 col-xs-12';
			vm.warData.inProgress = true;
		}
	};

	vm.adjustTargets = function() {
		var target;
		vm.attackOptions = [];
		vm.attackOptions2 = [];
		
		for (var i = 0; i < vm.warData.size; i++) {
			target = 'Attack ' + (i + 1).toString();
			found = false;
			for (var w = 0; w < vm.warData.warriors.length; w++) {
				if ((target) == vm.warData.warriors[w].attack1) {
					found = true;
					break;
				}
			};
			if (!found) 
				vm.attackOptions.push(target);
			vm.attackOptions2.push(target);
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
		var change = vm.warData.size - vm.warData.warriors.length;
		if (change > 0) {  // Then we need to add spots
			for (var i = 0; i < change; i++) {
				vm.warData.warriors.push({
					name: 'Pick Warrior',
					attack1: 'Pick',
					attack2: 'Ask',
					lock1: false,
					lock2: false,
					stars1: '0',
					stars2: '0',
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

	vm.moveWarrior = function(warrior, command) {
		var index = -1;

		// Find the index of the warrior
		for (var i = 0; i < vm.warData.warriors.length; i++) {
			if (vm.warData.warriors[i].name === warrior) {
				index = i;
				break;
			}
		};

		// Save and remove the warrior from the list
		var save = vm.warData.warriors[i];
		vm.warData.warriors.splice(i, 1);

		if (command == '^ 3')  // attempt to move up 3, otherwise catch overflow and set to 0
			index = ((index - 3) < 0 ? 0 : index - 3);  
		else if (command == '^ 2')  // attempt to move up 2, otherwise catch overflow and set to 0
			index = ((index - 2) < 0 ? 0 : index - 2);  
		else if (command == '^ 1')  // attempt to move up 1, otherwise catch overflow and set to 0
			index = ((index - 1) < 0 ? 0 : index - 1);  
		else if (command == ' X ') // Delete this entry
			index = -1;  
		else if (command == 'v 1')  // attempt to move down 1, otherwise catch overflow and set to max
			index = ((index + 1) >= vm.warData.warriors.length ? vm.warData.warriors.length - 1 : index + 1);
		else if (command == 'v 2')  // attempt to move down 2, otherwise catch overflow and set to max
			index = ((index + 2) >= vm.warData.warriors.length ? vm.warData.warriors.length - 1 : index + 2);
		else if (command == 'v 3')  // attempt to move down 3, otherwise catch overflow and set to max
			index = ((index + 3) >= vm.warData.warriors.length ? vm.warData.warriors.length - 1 : index + 3);  


		if (index != -1)  // We have to insert the element back into the array
			vm.warData.warriors.splice(index, 0, save);
		else  // Delete an entry, and correct warrior list
			vm.adjustWarriorList()

		vm.command = 'Move';  // Reset value to 'Move'
	};

	vm.genWarriorList = function () {
		vm.message = '';

		if (!vm.warData.opponent) {
			vm.message = 'Please set Opponent name';
			return;
		}
		vm.showWarriors = true;  // When the UI should show the warriors

		User.partial()
			.then(function(data) {
				vm.warData.users = data.data.data;

				if (vm.type == 'create') {

					// Generate the warrior list templates
					vm.warData.warriors = [];
					for (var i = 0; i < vm.warData.size; i++) {
						vm.warData.warriors.push({
							name: 'Pick Warrior',
							attack1: 'Pick',
							attack2: 'Ask',
							lock1: false,
							lock2: false,
							stars1: '0',
							stars2: '0',
							viewed: false
						});
					};
					// call the warService function to retrieve last war
					// War.last() 
					// 	.then(function(data) {
					// 		if (data.data) {
					// 			if (vm.type != 'create') {
					// 				for (var i = 0; i < data.data.warriors.length; i++) {
					// 					vm.warData.warriors[i] = data.data.warriors[i]
					// 				};
					// 			} else {
					// 				for (var i = 0; i < data.data.warriors.length; i++) {
					// 					vm.warData.warriors[i].name = data.data.warriors[i].name
					// 				};
					// 			};
					// 		}
					// 		vm.adjustUsers();
					// 		vm.adjustTargets();
					// 		vm.warriorsReady = true;
					// });
					vm.adjustUsers();
					vm.adjustTargets();
					vm.warriorsReady = true;

				} else {  // vm.type == 'Edit' || vm.type == 'View'
					vm.adjustUsers();
					vm.adjustTargets();
					vm.warriorsReady = true;
				}

		});
	};

	vm.validateFields = function() {
		if (vm.warData.opponent == '') {
			vm.message = 'Please set Opponent name';
			return false;
		}

		var warDataCleansed = {};

		warDataCleansed.createdAt = vm.warData.createdAt;
		warDataCleansed.opponent = vm.warData.opponent;
		warDataCleansed.size = vm.warData.size;
		warDataCleansed.inProgress = vm.warData.inProgress;

		// Date/Time needs to be set to UTC time
		var now = new Date();
		warDataCleansed.start = vm.warData.start + (now.getTimezoneOffset() * 60000);

		if (vm.warData.inProgress == false) {
			if (vm.warData.exp == undefined) {
				vm.message = 'Please set Exp Gained';
				return false;
			}
			if (vm.warData.ourScore == undefined) {
				vm.message = 'Please set Stars for SpaceMonkeys';
				return false;
			}
			if (vm.warData.theirScore == undefined) {
				vm.message = 'Please set Stars for ' + warDataCleansed.opponent;
				return false;
			}
			if (vm.warData.ourDest == undefined) {
				vm.message = 'Please set Destruction for Space Monkeys';
				return false;
			}
			if (vm.warData.theirDest == undefined) {
				vm.message = 'Please set Destruction for ' + warDataCleansed.opponent;
				return false;
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
				return false;
			}
		}

		for (var i = 0; i < vm.warData.warriors.length; i++) {
			if (vm.warData.warriors[i].name == 'Pick Warrior') {
				vm.message = 'Please Fill all Warrior Slots';
				// return false;
			}
		};
		warDataCleansed.warriors = vm.warData.warriors;

		return warDataCleansed;
	}

	// function to save the war
	vm.saveWar = function() { 
		vm.processing = true;
		vm.message = '';
		
		// Cleanse the data before passing to the database
		var warDataCleansed = vm.validateFields();
		if (!warDataCleansed)
			return;

		console.log(warDataCleansed);

		// call the userService function to update
		War.create(warDataCleansed)
			.then(function(data) {
				vm.processing = false; // clear the form
				// bind the message from our API to vm.message
				vm.message = data.data;
				// $location.path('/wars');
		});
	};

	vm.updateWar = function(print) {
		vm.message = '';

		console.log('Update 1');
		console.log(vm.warData.startDisplay);
		
		// Cleanse the data before passing to the database
		var warDataCleansed = vm.validateFields();
		if (!warDataCleansed)
			return;

		console.log('Update 2');
		console.log(vm.warData.startDisplay);
		temp = new Date(warDataCleansed.start);
		console.log(temp);

		// call the userService function to update
		War.update($routeParams.war_id, warDataCleansed) 
			.then(function(data) {
				vm.processing = false; // clear the form
				// bind the message from our API to vm.message
				if (print) {
					vm.message = data.data.message;
					// setTimeout(alert("HIIII"), 2000);
				}
		});
	};

	vm.reloadPage = function () {
		$route.reload();
	};

	// Finish loading the page
	if (vm.type != 'create') {
		War.get($routeParams.war_id)
			.then(function(data) {
				vm.warData = data.data.data;

				// Set Date-Time to be in the proper format
				var now = new Date();

				vm.warData.start = (vm.warData.start - (now.getTimezoneOffset() * 60000));
				vm.warData.startDisplay = new Date(vm.warData.start);
				
				// Set Countdown timers
				vm.battleCountdown = vm.warData.start + 169200000;  	// Add 47 Hours
				vm.preparationCountdown = vm.warData.start + 82800000;  // Add 23 Hours

				vm.checkDate();
				vm.loadingPage = false;

				if (vm.type == 'view') {
					Auth.getUser().then(function(data) {
						vm.userInfo = data.data;
						for (var i = 0; i < vm.warData.warriors.length; i++) {
							if (vm.warData.warriors[i].name == vm.userInfo.name) {
								vm.warData.warriors[i].viewed = true;
								vm.updateWar(false);
							}
						};
					});
				}
				vm.genWarriorList();
		});
	} else {
		vm.checkDate();
		vm.loadingPage = false;
	}

});

// // controller applied to user edit page
// .controller('warEditController', function($routeParams, $location, War) { 
// 	var vm = this;
// 	// variable to hide/show elements of the view // differentiates between create or edit pages 
// 	vm.type = 'edit';

// 	// get the user data for the user you want to edit // $routeParams is the way we grab data from the URL 
// 	War.get($routeParams.war_id)
// 		.success(function(data) {
// 			vm.warData = data;

// 			// Set a few parameters that come back in the wrong format
// 			vm.warData.start = new Date(vm.warData.start);
// 	});

// 	vm.upload_file = function(file, signed_request, url){
// 		var xhr = new XMLHttpRequest();
// 		xhr.open("PUT", signed_request);
// 		xhr.setRequestHeader('x-amz-acl', 'public-read');
// 		xhr.onload = function() {
// 			if (xhr.status === 200) {
// 				vm.warData.img = url
// 				// call the userService function to update
// 				War.update($routeParams.war_id, vm.warData) 
// 					.success(function(data) {
// 						vm.processing = false; // clear the form
// 						// bind the message from our API to vm.message
// 						vm.message = data.message;
// 						$location.path('/wars');
// 				});
// 			}
// 		};
// 		xhr.onerror = function() {
// 			alert("Could not upload file.");
// 		};
// 		xhr.send(file);
// 	}

// 	// function to save the war
// 	vm.saveWar = function() { 
// 		vm.processing = true; 
// 		vm.message = '';

// 		if (vm.warData.file != null) {
// 			console.log("Saving Photo");
// 			War.upload(vm.warData.file)
// 				.then(function(data) {
// 					vm.processing = false;
// 					if (data.status == 200) {
// 						console.log(data.data);
// 						vm.upload_file(vm.warData.file, data.data.signed_request, data.data.url);
// 					} else {
// 						vm.message = 'Could not get signed URL.';
// 					}
// 			});
// 		}
// 		else {
// 			// call the userService function to update
// 			War.update($routeParams.war_id, vm.warData) 
// 				.success(function(data) {
// 					vm.processing = false; // clear the form
// 					// bind the message from our API to vm.message
// 					vm.message = data.message;
// 					$location.path('/wars');
// 			});
// 		}
// 	};
// })




