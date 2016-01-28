angular.module('clanCtrl', [])

// Controller for all clans
// .controller('clanController', function($location, Auth, War) {
// 	var vm = this;

// })

.controller('clanRegisterController', function($location, Auth, War) {
	var vm = this;

	vm.type = 'register';

	// Initialize Form Data
	vm.clanData = {}  // Object will be filled by the page

	vm.registerClan = function() { 
		vm.processing = true;
		vm.message = '';
		
		// // Cleanse the data before passing to the database
		// var warDataCleansed = vm.validateFields(vm.warData);
		// if (!warDataCleansed)
		// 	return;

		// if (warDataCleansed.inProgress)
		// 	vm.updateUsers(warDataCleansed.warriors);

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