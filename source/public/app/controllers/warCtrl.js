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
			return (a.number < b.number) ? 1 : (a.number > b.number) ? -1 : 0;
		});
	});
})

// controller applied to user creation page
.controller('warCreateController', function(War) { 
	var vm = this;
	// variable to hide/show elements of the view 
	// differentiates between create or edit pages 
	vm.type = 'create';

	vm.warData = {};
	vm.warData.approved = true;
	vm.warData.inClan = true;
	vm.warData.admin = false;

	// function to create a user
	vm.saveWar = function() { 
		vm.processing = true;
		// clear the message
		vm.message = '';
		// use the create function in the userService
		War.create(vm.warData) 
			.success(function(data) {
				vm.processing = false;
				// clear the form
				vm.warData = {};
				vm.message = data.message;
		});
	};
})

// controller applied to user edit page
.controller('warEditController', function($routeParams, War) { 
	var vm = this;
	// variable to hide/show elements of the view // differentiates between create or edit pages 
	vm.type = 'edit';
	// get the user data for the user you want to edit // $routeParams is the way we grab data from the URL 
	War.get($routeParams.war_id)
		.success(function(data) {
			vm.warData = data;
			vm.warData.date = new Date(vm.warData.date);
	});
	// function to save the user
	vm.saveWar = function() { 
		vm.processing = true; 
		vm.message = '';
		// call the userService function to update
		War.update($routeParams.war_id, vm.warData) 
			.success(function(data) {
				vm.processing = false; // clear the form
				// bind the message from our API to vm.message
				vm.message = data.message;
		});
	};
});




