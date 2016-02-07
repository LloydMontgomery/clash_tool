angular.module('clanCtrl', [])

// Controller for all clans
// .controller('clanController', function($location, Auth, War) {
// 	var vm = this;

// })

.controller('clanRegisterController', function($location, Auth, Clan) {
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

		// call the userService function to update
		Clan.create(vm.clanData)
			.then(function(data) {
				vm.processing = false; // clear the form
				// bind the message from our API to vm.message
				vm.message = data.data.message;
				console.log(data.data);
				$location.path('/wars');
		});
	};

})

.controller('clanJoinController', function($location, Auth, Clan) {

	var vm = this;

	vm.searchForClan = function() {
		console.log('Here');
	}
});







