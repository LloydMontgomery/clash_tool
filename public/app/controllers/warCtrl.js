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

	vm.dest1Options = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25',
					  '26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50',
					  '51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75',
					  '76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'];
	vm.dest2Options = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25',
					  '26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50',
					  '51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75',
					  '76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99'];


	/* ======================== DYNAMIC PAGE CONTROL ======================== */

	vm.setMaxStars = function() {
		vm.maxStars = Array.apply(null, Array((vm.warData.size.value*3)+1)).map(function (_, i) {return i;});
		
		if (vm.warData.ourScore > (vm.warData.size.value*3))
			vm.warData.ourScore = Number(vm.warData.size.value*3);

	};

	vm.checkDate = function() {
		now = new Date();
		vm.warStatus = "In Progress";
		if ((now.getTime() - vm.warData.start.getTime()) > 169200000) {  // Over 47 hours since war started
			vm.warStatus = "War Over";
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

	vm.checkWarStatus = function (arg) {
		console.log(arg);
		if (vm.inProgress) {  // Let the user know the war is in progress
			console.log("Hello");
		}
	};

	vm.warriorList = function () {
		console.log("EYO");
		vm.message = '';

		if (!vm.warData.opponent) {
			vm.message = 'Please set Opponent name';
			return;
		}

		vm.showWarriors = true;


		
		// call the warService function to retrieve last war
		// War.last() 
		// 	.then(function(data) {
		// 		console.log(data.data.warriors);
		// 		vm.warData.warriors = data.data.warriors;
		// 		vm.warriorsReady1 = true;
		// 		// bind the message from our API to vm.message
		// 		vm.message = data.message;
				
		// });

		// User.all() 
		// 	.then(function(data) {
		// 		console.log(data.data);
		// 		vm.warData.users = data.data;
		// 		vm.warriorsReady2 = true;
		// 		// bind the message from our API to vm.message
		// 		vm.message = data.message;	
		// });
	};

	vm.warData.warriors = [{
		name: 'Zephyro',
		attack1: 'Hold',
		attack2: 'Hold',
		lock1: false,
		lock2: false,
		stars1: Number,
		stars2: Number,
		viewed: Boolean
	},{
		name: 'Jessica',
		attack1: '2',
		attack2: 'Hold',
		lock1: false,
		lock2: false,
		stars1: Number,
		stars2: Number,
		viewed: Boolean
	},{
		name: 'Imperial',
		attack1: '3',
		attack2: 'Hold',
		lock1: false,
		lock2: false,
		stars1: Number,
		stars2: Number,
		viewed: Boolean
	}];


	// function to save the war
	vm.saveWar = function() { 
		vm.processing = true;
		vm.message = '';
		console.log(vm.warData);
		
		// Cleanse the data before passing to the database
		var warDataCleansed = {};

		if (vm.warData.opponent == '') {
			vm.message = 'Please set Opponent name';
			return;
		}

		warDataCleansed.opponent = vm.warData.opponent;
		warDataCleansed.size = vm.warData.size.value;
		warDataCleansed.start = vm.warData.start;

		if (vm.inProgress == false) {
			if (vm.warData.ourScore == undefined) {
				vm.message = 'Please set Stars for SpaceMonkeys';
				return;
			}
			if (vm.warData.theirScore == undefined) {
				vm.message = 'Please set Stars for ' + warDataCleansed.opponent;
				return;
			}

			// Convert the strings into a number using the two parts
			warDataCleansed.ourDest = Number(vm.warData.ourDest1) + (Number(vm.warData.ourDest2)/100);
			warDataCleansed.theirDest = Number(vm.warData.theirDest1) + (Number(vm.warData.theirDest2)/100);
			warDataCleansed.ourScore = Number(vm.warData.ourScore);
			warDataCleansed.theirScore = Number(vm.warData.theirScore);
			warDataCleansed.start = vm.warData.start;

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

		warDataCleansed.warriors = vm.warData.warriors;

		console.log(warDataCleansed);


		

		// call the userService function to update
		// War.create(vm.warDataCleansed)
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



