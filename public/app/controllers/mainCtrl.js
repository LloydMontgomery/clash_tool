angular.module('mainCtrl', ['ui.bootstrap'])
.controller('mainController', function($rootScope, $location, $window, Auth, User, War) {
	var vm = this;

	// These are assigned here mainly to save clutter in the HTML page
	vm.authSizing = 'col-xs-10 col-xs-offset-1 col-sm-8 col-sm-offset-2 col-lg-4 col-lg-offset-4';
	vm.mainPageSizing = 'col-xs-12 col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3';
	vm.buttonRoutingSizing = 'col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-lg-4 col-lg-offset-4';

	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();

	// Style attribute space for red borders
	vm.styles = {};
	
	vm.loginData = {};

	// Keeps the proper Navbar option highlighted; reflects the page currently visiting
	var setActive = function(active) {
		document.getElementById('navUsers').className = '';
		document.getElementById('navWars').className = '';
		document.getElementById('navHome').className = '';
		document.getElementById('navProfile').className = '';
		document.getElementById(active).className = 'active';
	}

	var checkRoutePermission = function(route) {
		/* Routes that anyone can go to */
		if (route == '/splash') {
			if (vm.loggedIn){  // If a user is already logged in, don't let them go to the login page via "back"
				setActive('navHome');
				$location.path('/');
			} else {  // User is not logged in, let them go there
				$location.path('/splash');
			}
			return;
		}
		if (route == '/') {  // home
			if (vm.loggedIn){  // If a user is already logged in, don't let them go to the login page via "back"
				setActive('navHome');
				$location.path('/');
			} else {  // User is not logged in, let them go there
				$location.path('/splash');
			}
			return;
		}
		if (route == '/login') {
			if (vm.loggedIn){  // If a user is already logged in, don't let them go to the login page via "back"
				setActive('navHome');
				$location.path('/');
			} else {  // User is not logged in, let them go there
				setActive('navProfile');
			}
			return;
		} 

		/* Logged In Authentication */
		if (!vm.loggedIn){
			setActive('navHome');
			$location.path('/');
			return;
		}

		/* Routes that only people who are logged in can go to */
		if (route == '/wars') {
			setActive('navWars');
			return;
		}
		if (route.indexOf('/wars/view') > -1) {
			setActive('navWars');
			return;
		}
		if (route.indexOf('/users/profile') > -1) {
			setActive('navProfile');
			return;
		}

		/* Admin In Authentication */
		if (!vm.userInfo.admin){
			setActive('navHome');
			$location.path('/');
			return;
		}

		if (route.indexOf('/wars/edit') > -1) {
			setActive('navWars');
			return;
		}
		if (route.indexOf('/users') > -1) {
			setActive('navUsers');
			return;
		}
		
	}
	
	// check to see if a user is logged in on every request
	var routeChange = function() {

		vm.loggedIn = Auth.isLoggedIn();

		// get user information on route change
		if (vm.loggedIn) {
			Auth.getUser().then(function(data) {
				vm.userInfo = data.data;
				checkRoutePermission($location.path());
			});
		} else {
			checkRoutePermission($location.path());
		}

		// Grab all users & wars if routing to main page
		if ($location.path() == '/') {
			User.partial().then(function(data) {
				if (data.data.success) {

					// bind the users that come back to vm.users
					vm.users = data.data.data;
					vm.users.sort(function(a, b) {
						return (a.dateJoined < b.dateJoined) ? -1 : (a.dateJoined > b.dateJoined) ? 1 : 0;
					});

					for (var i = 0; i < vm.users.length; i++) {
						vm.users[i].dateJoined = new Date(Number(vm.users[i].dateJoined)); // Convert milliseconds to date object
					};

					vm.leaders = [];
					vm.elders  = [];
					vm.members = [];

					for (var i = 0; i < vm.users.length; i++) {
						if (vm.users[i].title.indexOf('Leader') > -1)
							vm.leaders.push(vm.users[i]);
						else if (vm.users[i].title == 'Elder')
							vm.elders.push(vm.users[i]);
						else
							vm.members.push(vm.users[i]);
					};

					delete vm.users;
					
				} else {
					// Do Something
				}
			});
			War.partial().then(function(data) {
				if (data.data.success) {

					// Bind the wars that come back to vm.wars
					vm.wars = data.data.data;

					vm.wars.sort(function(a, b) {
						return (a.start < b.start) ? -1 : (a.start > b.start) ? 1 : 0;
					});

					now = new Date();
					for (var i = 0; i < vm.wars.length; i++) {
						vm.wars[i].start = new Date(Number(vm.wars[i].start - (now.getTimezoneOffset() * 60000))); // Convert milliseconds to date object
					};

				} else {
					// Do Something
				}
			});

			// Load Clan Information
			vm.clan = {
				name: "ALLIWANTISWAR",
				members: "50",
				warWins: "153",
				avDest: "91.76",
				totalStars: "24220"
			}
		}
	};

	$rootScope.$on('$routeChangeStart', function () {
		routeChange();
	});

	vm.viewProfile = function(name) {
		console.log("HERE");
		if (vm.loggedIn)
			$location.path('/users/profile/' + name);
	}
	
	vm.currentWar = function(start) {
		$location.path('/wars/view/' + Number(start).toString());
	}

	// function to handle login form
	vm.processAuth = function() {
		vm.processing = true;

		// clear the error
		vm.error = '';
		vm.message = '';

		if (!vm.loginData.username)
			vm.styles.username = 'invalid-field';
		if (!vm.loginData.password)
			vm.styles.password = 'invalid-field';
		if (vm.isRegistering) {
			if (!vm.loginData.name)
				vm.styles.name = 'invalid-field';
			if (!vm.loginData.passwordConfirm)
				vm.styles.passwordConfirm = 'invalid-field';
		} else {
			vm.styles.name = '';
			vm.styles.passwordConfirm = '';
		}
		if (vm.styles.username || vm.styles.password || vm.styles.name || vm.styles.passwordConfirm) {
			vm.error = 'Please fill in all fields';
			vm.processing = false;
			return;
		}

		var login = function() {
			Auth.login(vm.loginData.username, vm.loginData.password)
				.then(function(data) {
					vm.processing = false;
					// if a user successfully logs in, redirect to users page
					if (data.data.success) {
						$location.path('/');
					}
					else {
						vm.loginData.password = '';  // Clear password
						vm.loginData.passwordConfirm = '';  // Clear password
						vm.error = data.data.message;
					}
			});
		}

		if (!vm.isRegistering) {  // Then user is trying to log in
			login();
		} else {
			if (vm.loginData.password != vm.loginData.passwordConfirm){
				vm.error = 'Passwords do not match';
				vm.processing = false;
			} else {
				// use the create function in the userService
				User.create(vm.loginData)
					.then(function(data) {
						if (data.data.success) {
							vm.loginData.password = '';  // Clear password
							vm.loginData.passwordConfirm = '';  // Clear password
							login();
						} else {
							vm.loginData.password = '';  // Clear password
							vm.loginData.passwordConfirm = '';  // Clear password
							vm.error = data.data.message;
						}
						vm.processing = false;
				});
			}
		}
	};

	// function to handle logging out
	vm.doLogout = function() {
		Auth.logout();
		vm.loggedIn = false;
		// reset all user info 
		vm.userInfo = {}; 
		$location.path('/login');
	};
});