angular.module('clanCtrl', [])

// Controller for all clans
// .controller('clanController', function($location, Auth, War) {
// 	var vm = this;

// })

.controller('clanRegisterController', function($location, Auth, AuthToken, Clan) {
	var vm = this;

	Auth.getUser().then(function(data) {
		vm.userInfo = data.data;
	});

	vm.type = 'register';

	// Style Data, used for red outlines
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

		vm.clanData.username = vm.userInfo.username;

		// call the userService function to update
		Clan.create(vm.clanData)
			.then(function(data) {
				console.log('Token?');
				console.log(data.data.token);
				AuthToken.setToken(data.data.token);
				vm.processing = false; // clear the form
				$location.path('/');
		});
	};

})

.controller('clanJoinController', function($location, Auth, Clan) {

	var vm = this;

	// Style Data, used for red outlines
	vm.styles = {};

	vm.clans = [
		// { 'name' : 'Lloyd',
		//   'ref' : '@1338',
		//   'warsWon' : 138
		// }
	];

	vm.searchForClan = function() {
		vm.processing = true;
		vm.message = '';

		// Validate that the field is actually filled in
		if (vm.ref && vm.ref.length == 4) {
			;  // Everything is fine
		} else {
			vm.message = 'Please Enter Exactly 4 Characters';
			vm.styles.ref = 'invalid-field';
			vm.processing = false;
			return;
		}

		var ref = vm.ref.toUpperCase()

		// Do a Scan for all clans with this name
		Clan.find(ref)
			.then(function(data) {
				if (data.data.success) {
					data = data.data.data;

					// Reset clans data, and push the new data on
					vm.clans = [];
					vm.clans.push(data)  // This only works because I am currently only returning a single clan
					
				} else {
					vm.message = 'Clan Reference: @' + ref + ' not found';
				}

				vm.processing = false
		})
	}

	vm.joinClan = function(clanRef) {
		vm.joinProcessing = true;
		console.log(clanRef);

		// Add code to actually join a clan here.
		// Currently not possible, need to improve user model first

		// vm.joinProcessing = false;

	}
});







