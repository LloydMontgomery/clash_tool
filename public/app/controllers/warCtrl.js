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

	vm.statusOptions = [ 	'Preparation',
							'Battle',
							'Over'];

	// Date and Time picker for war start
	vm.warData.startDate = new Date();

	vm.warData.startHour = vm.warData.startDate.getHours().toString();
	if(vm.warData.startHour.length == 1)
		vm.warData.startHour = '0' + vm.warData.startHour.toString();

	vm.warData.startMinute = vm.warData.startDate.getMinutes().toString();
	if(vm.warData.startMinute.length == 1)
		vm.warData.startMinute = '0' + vm.warData.startMinute.toString();
	
	vm.hourOptions = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
	vm.minuteOptions = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29',
					  '30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59'];

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

	vm.warriorList = function () {
		if (vm.warData.name) {
			vm.showWarriors = true;
			
			// call the warService function to retrieve last war
			War.last() 
				.then(function(data) {
					console.log(data.data.warriors);
					vm.warData.warriors = data.data.warriors;
					vm.warriorsReady1 = true;
					// bind the message from our API to vm.message
					vm.message = data.message;
					
			});

			User.all() 
				.then(function(data) {
					console.log(data.data);
					vm.warData.users = data.data;
					vm.warriorsReady2 = true;
					// bind the message from our API to vm.message
					vm.message = data.message;	
			});
		}

	};

	// vm.warData.warriors = [];

	// vm.warData = {
	// 	exp: 125,
	// 	ourScore: 50,
	// 	theirScore: 30,
	// 	ourDest: 90,
	// 	theirDest: 70,
	// 	start: Date(),
	// 	size: 10,
	// 	status: 'Preparation',
	// 	img: 'https://s3-us-west-2.amazonaws.com/clashtool/Sun+Nov+22+2015',
	// 	warriors: [{	name: 'Zephyro',
	// 					attack1: 'Hold',
	// 					attack2: 'Hold',
	// 					lock1: false,
	// 					lock2: false,
	// 					stars1: Number,
	// 					stars2: Number,
	// 					viewed: false },
	// 				{	name: 'Jessica',
	// 					attack1: '1',
	// 					attack2: 'Hold',
	// 					lock1: false,
	// 					lock2: true,
	// 					stars1: Number,
	// 					stars2: Number,
	// 					viewed: false}]
	// };

	vm.warData.file = null;  // Just while testing, don't want to be pushing images every test


	// vm.warData = {};
	// vm.warData.date = new Date();

	vm.upload_file = function(file, signed_request, url){
		vm.message=''; // Clear message
		var xhr = new XMLHttpRequest();
		xhr.open("PUT", signed_request);
		xhr.setRequestHeader('x-amz-acl', 'public-read');
		xhr.onload = function() {
			if (xhr.status === 200) {
				vm.warData.img = url
				// call the userService function to update
				War.create(vm.warData) 
					.success(function(data) {
						vm.processing = false; // clear the form
						// bind the message from our API to vm.message
						vm.message = data.message;
						$location.path('/wars');
				});
			}
		};
		xhr.onerror = function() {
			vm.message = data.message;
		};
		xhr.send(file);
	}

	// function to save the war
	vm.saveWar = function() { 
		vm.processing = true; 
		vm.message = '';

		if (vm.warData.file) {
			War.upload(vm.warData)
				.then(function(data) {
					vm.processing = false;
					if (data.status == 200) {
						console.log(data.data);
						vm.upload_file(vm.warData.file, data.data.signed_request, data.data.url);
					} else {
						vm.message = 'Could not get signed URL.';
					}
			});
		} else {
			// call the userService function to update
			War.create(vm.warData) 
				.then(function(data) {
					vm.processing = false; // clear the form
					// bind the message from our API to vm.message
					vm.message = data.data;
					// $location.path('/wars');
			});
		}
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

			console.log(vm.warData);
			// vm.warData.
			vm.loadingPage = false;

			vm.timeRemaining = 1451628000000;
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



