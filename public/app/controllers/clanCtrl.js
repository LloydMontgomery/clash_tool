angular.module('clanCtrl', [])

// Controller for all clans
// .controller('clanController', function($location, Auth, War) {
// 	var vm = this;

// })

.controller('clanRegisterController', function($location, Auth, War) {
	var vm = this;

	vm.type = 'register';

	// Style Data
	vm.styles = {};

	// Initialize Form Data
	vm.clanData = {}  // Object will be filled by the page

	vm.resetClass = function(className) {
		vm.styles[className] = '';
	}

	vm.registerClan = function() { 
		vm.processing = true;
		vm.message = '';

		// Field Validation
		if (!vm.clanData.name)
			vm.styles.name = 'invalid-field';
		if (!vm.clanData.totalWars)
			vm.styles.totalWars = 'invalid-field';
		if (!vm.clanData.warsWon)
			vm.styles.warsWon = 'invalid-field';
		if (vm.styles.name || vm.styles.totalWars || vm.styles.warsWon)
			return;

		console.log('All Fields Filled In');

		// // call the userService function to update
		// War.create(warDataCleansed)
		// 	.then(function(data) {
		// 		vm.processing = false; // clear the form
		// 		// bind the message from our API to vm.message
		// 		vm.message = data.data.message;
		// 		$location.path('/wars');
		// });
	};

});