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
			return (a.start < b.start) ? 1 : (a.start > b.start) ? -1 : 0;
		});

		now = new Date();
		for (var i = 0; i < vm.wars.length; i++) {
			vm.wars[i].start = new Date(Number(vm.wars[i].start)); // Convert milliseconds to date object
		};

		console.log(vm.wars);

		// when all the wars come back, remove the processing variable
		vm.processing = false;
	});
})

// controller applied to War creation page
.controller('warManipulationController', function($route, $routeParams, $location, $timeout, Auth, War, User) { 
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
	vm.thLvls = ['11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

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
		if (auto || vm.type != 'view') {
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
	};

	vm.checkDate = function() {
		if (!vm.warData.startDisplay)
			return;
		vm.warData.start = vm.warData.startDisplay.getTime();

		vm.battleCountdown = vm.warData.start + 169200000;  		// Add 47 Hours
		vm.preparationCountdown = vm.warData.start + 82800000;  	// Add 23 Hours

		now = new Date();
		var timeSinceStart = (now.getTime() - vm.warData.start)

		vm.warStatsSubContainer = '';  // Default to this
		if (timeSinceStart > 169200000) {  // Over 47 hours since war started
			vm.warStatus = 'War Over';  // Never displayed, but still the context
			vm.warData.inProgress = false;
			vm.attackClass = 'col-xs-12';
			vm.inProgressClass = '';
		} else if (timeSinceStart > 82800000) {  // Between 23 and 47 hours since beginning
			vm.warStatus = 'Battle Day';
			vm.inProgressClass = 'greyedOutText';
			vm.warStatsSubContainer = 'col-sm-offset-2';
			vm.attackClass = 'col-xs-6';
			vm.warData.inProgress = true;
		} else {  // Between 0 and 23 hours since beginning
			vm.warStatus = 'Preparation Day';
			vm.inProgressClass = 'greyedOutText';
			vm.warStatsSubContainer = 'col-sm-offset-2';
			vm.attackClass = 'col-xs-6';
			vm.warData.inProgress = true;
		}
	};

	vm.adjustTargets = function() {
		if (vm.type == 'create') {
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
		}
	};

	vm.adjustUsers = function() {
		vm.warData.actUsers = [];  // Empty the array
		var found;

		for (var u = 0; u < vm.warData.users.length; u++) {
			found = false;
			for (var w = 0; w < vm.warData.warriors.length; w++) {
				if (vm.warData.warriors[w].name === vm.warData.users[u].name) {
					found = true;
					vm.warData.warriors[w].thLvl = vm.warData.users[u].thLvl;  // While we are here...
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
					thLvl: '0',
					attack1: 'Pick',
					attack2: 'Ask',
					lock1: false,
					lock2: false,
					stars1: '0',
					stars2: '0',
					viewed: false
				});
				vm.warData.opposingWarriors.push();
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

	vm.genWarriorList = function() {
		vm.message = '';

		if (!vm.warData.opponent) {
			vm.message = 'Please set Opponent name';
			return;
		}
		vm.showWarriors = true;  // When the UI should show the warriors

		User.partial()
			.then(function(data) {

				if (data.data.success) {
					vm.warData.users = data.data.data;

					if (vm.type == 'create') {

						// Generate the warrior list templates
						vm.warData.warriors = [];
						for (var i = 0; i < vm.warData.size; i++) {
							vm.warData.warriors.push({
								name: 'Pick Warrior',
								thLvl: '0',
								attack1: 'Pick',
								attack2: 'Ask',
								lock1: false,
								lock2: false,
								stars1: '0',
								stars2: '0',
								viewed: false
							});
						};

						vm.adjustUsers();
						vm.adjustTargets();
						vm.warriorsReady = true;

					} else {  // vm.type == 'Edit' || vm.type == 'View'
						vm.adjustUsers();
						vm.adjustTargets();
						vm.warriorsReady = true;
					}
				} else {
					// Database Error, decide what to do here
			}
		});
	};

	vm.genOpposingWarriorList = function() {
		vm.warData.opposingWarriors = [];
		for (var i = 0; i < vm.warData.size; i++) {
			vm.warData.opposingWarriors.push({
				thLvl: vm.warData.warriors[i].thLvl
			});
		};
		vm.opposingWarriorsReady = true;
	};

	vm.validateFields = function(data) {
		if (data.opponent == '') {
			vm.message = 'Please set Opponent name';
			return false;
		}

		var warDataCleansed = {};
		if (data.createdAt)
			warDataCleansed['createdAt'] = data.createdAt;
		warDataCleansed.opponent = data.opponent;
		warDataCleansed.size = data.size;
		warDataCleansed.inProgress = data.inProgress;

		warDataCleansed.start = data.start;

		if (data.inProgress == false) {
			if (data.exp == undefined) {
				vm.message = 'Please set Exp Gained';
				return false;
			}
			if (data.ourScore == undefined) {
				vm.message = 'Please set Stars for SpaceMonkeys';
				return false;
			}
			if (data.theirScore == undefined) {
				vm.message = 'Please set Stars for ' + warDataCleansed.opponent;
				return false;
			}
			if (data.ourDest == undefined) {
				vm.message = 'Please set Destruction for Space Monkeys';
				return false;
			}
			if (data.theirDest == undefined) {
				vm.message = 'Please set Destruction for ' + warDataCleansed.opponent;
				return false;
			}
			if (data.img) {
				warDataCleansed.img = data.img;
			}

			warDataCleansed.exp = data.exp;
			warDataCleansed.ourDest = data.ourDest;
			warDataCleansed.theirDest = data.theirDest;
			warDataCleansed.ourScore = Number(data.ourScore);
			warDataCleansed.theirScore = Number(data.theirScore);

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

		warDataCleansed.warriors = [];
		for (var i = 0; i < data.warriors.length; i++) {
			warDataCleansed.warriors.push(data.warriors[i]);
			if (vm.warData.warriors[i].name == 'Pick Warrior') {
				vm.message = 'Please Fill all Warrior Slots';
				return false;
			}
		};

		return warDataCleansed;
	};

	vm.updateUsers = function(warriors) {

		for (i in warriors) {
			createdAt = vm.warData.createdAt;
			temp = {};
			temp[createdAt] = {
				'opponent' : vm.warData.opponent,
				'start' : vm.warData.start,
				'warPos' : (Number(i)+1).toString(),
				'attack1' : {
					'targetPos' : 'N/A',
					'stars' : warriors[i].stars1
				},
				'attack2' : {
					'targetPos' : 'N/A',
					'stars' : warriors[i].stars2
				}
			}

			User.setProfile(warriors[i].name, temp);
		};
	};

	vm.saveWar = function() { 
		vm.processing = true;
		vm.message = '';
		
		// Cleanse the data before passing to the database
		var warDataCleansed = vm.validateFields(vm.warData);
		if (!warDataCleansed)
			return;

		if (warDataCleansed.inProgress)
			vm.updateUsers(warDataCleansed.warriors);

		// call the userService function to update
		War.create(warDataCleansed)
			.then(function(data) {
				vm.processing = false; // clear the form
				// bind the message from our API to vm.message
				vm.message = data.data.message;
				$location.path('/wars');
		});
	};

	vm.updateWar = function(quick, data) {
		vm.message = '';
		
		if (!quick) {
			// Cleanse the data before passing to the database
			var warDataCleansed = vm.validateFields(data);
			// If there were any errors in validation, do not proceed
			if (!warDataCleansed)
				return;

			// Update all the users in this war
			if (!vm.warData.inProgress)
				vm.updateUsers(data.warriors);

		} else {
			warDataCleansed = data;
		}

		// call the userService function to update
		War.update($routeParams.war_id, warDataCleansed) 
			.then(function(data) {
				vm.processing = false; // clear the form
				// bind the message from our API to vm.message
				if (!quick) {
					vm.message = data.data.message;
					$location.path('/wars');
				}
		});
	};

	vm.uploadImg = function() {
		vm.upload_file = function(file, signed_request, url){
			var xhr = new XMLHttpRequest();
			xhr.open("PUT", signed_request);
			xhr.setRequestHeader('x-amz-acl', 'public-read');
			xhr.onload = function() {
				if (xhr.status === 200) {
					vm.warData.img = url
					// call the userService function to update
					vm.warData.file = null;
					vm.processingImg = false;
					vm.updateWar(true, vm.warData);
				} else {
					vm.processingImg = false;
				}
			};
			xhr.onerror = function() {
				alert("Could not upload file.");
				processingImg = false;
			};
			xhr.send(file);
		}

		if (vm.warData.file) {
			vm.processingImg = true;
			War.upload(vm.warData.file)
				.then(function(data) {
					vm.processing = false;
					if (data.status == 200) {
						vm.upload_file(vm.warData.file, data.data.signed_request, data.data.url);
					} else {
						vm.processingImg = false;
						vm.message = 'Could not get signed URL.';
					}
			});
		}
	}

	vm.reloadPage = function() {
		$route.reload();
	};

	// Finish loading the page
	if (vm.type != 'create') {
		War.get($routeParams.war_id)
		.then(function(data) {
			vm.warData = data.data.data;

			vm.warData.startDisplay = new Date(Number(vm.warData.start));

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
							if (vm.warData.warriors[i].viewed == false) {
								pos = i.toString();
								tempData = { 'createdAt':vm.warData.createdAt,
											 'warriors':{}
											};
								tempData.warriors[i] = vm.warData.warriors[i];
								tempData.warriors[i].viewed = true;
								vm.updateWar(true, tempData);
							}
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


