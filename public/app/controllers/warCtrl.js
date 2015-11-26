// start our angular module and inject userService
angular.module('warCtrl', ['warService'])
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
.controller('warCreateController', function(War) { 
	var vm = this;
	// variable to hide/show elements of the view 
	// differentiates between create or edit pages 
	vm.type = 'create';

	vm.sizeOptions = [	{display: '10 vs 10', value: 10}, 
						{display: '15 vs 15', value: 15},
						{display: '20 vs 20', value: 20}];

	vm.statusOptions = [ 	'Preparation',
							'Battle',
							'Over'];

	vm.warData = {};


	// vm.warData = {};
	// vm.warData.date = new Date();

	// vm.upload_file = function(file, signed_request, url){
	// 	vm.message= ''; // Clear message
	// 	var xhr = new XMLHttpRequest();
	// 	xhr.open("PUT", signed_request);
	// 	xhr.setRequestHeader('x-amz-acl', 'public-read');
	// 	xhr.onload = function() {
	// 		if (xhr.status === 200) {
	// 			vm.warData.img = url
	// 			// call the userService function to update
	// 			War.create(vm.warData) 
	// 				.success(function(data) {
	// 					vm.processing = false; // clear the form
	// 					// bind the message from our API to vm.message
	// 					vm.message = data.message;
	// 					$location.path('/wars');
	// 			});
	// 		}
	// 	};
	// 	xhr.onerror = function() {
	// 		vm.message = data.message;
	// 	};
	// 	xhr.send(file);
	// }

	// // function to save the war
	// vm.saveWar = function() { 
	// 	vm.processing = true; 
	// 	vm.message = '';

	// 	if (vm.warData.file) {
	// 		War.upload(vm.warData)
	// 			.then(function(data) {
	// 				vm.processing = false;
	// 				if (data.status == 200) {
	// 					console.log(data.data);
	// 					vm.upload_file(vm.warData.file, data.data.signed_request, data.data.url);
	// 				} else {
	// 					vm.message = 'Could not get signed URL.';
	// 				}
	// 		});
	// 	} else {
	// 		vm.processing = false;
	// 		vm.message = 'War Photo Required';
	// 	}
	// };
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
			vm.warData.originalImg
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
});



