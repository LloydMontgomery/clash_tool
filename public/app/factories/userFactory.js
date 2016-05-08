angular.module('userFactory', []) 
.factory('User', function($http) {

	/* STATIC FUNCTIONS */

	// get a single user profile
	User.getProfile = function(username) { 
		return $http.get('api/users/profile/' + username);
	};

	// get all users
	User.all = function() { 
		return $http.get('/api/users/');
	};

	// set a single user profile
	User.setProfile = function(username, userData) {
		return $http.put('/api/users/profile/' + username, userData);
	};



	// create a new object
	var userFactory = {};

	// Constructor
	function User(){
		// Create properties
		// this.username

		// this.gamename
		// this.clan

		// thLvl
		// kingLvl
		// kingFinishDate
		// queenLvl
		// queenFinishDate
		// wardenLvl

		// dateJoinedSite
		// siteAdmin
	};

	User.prototype.create = function() {
		console.log("Creating a User");
		return $http.post('/api/users/', userData);
	};




	// v v v v v NOT DONE YET v v v v v

	// get a single user
	userFactory.get = function(id) { 
		return $http.get('/api/users/' + id);
	};
	// get partial users
	userFactory.partial = function() { 
		return $http.get('/api/partialUsers/');
	};
	
	// update a user
	userFactory.update = function(id, userData) { 
		return $http.put('/api/users/' + id, userData);
	};
	// delete a user
	userFactory.delete = function(name) { 
		return $http.delete('/api/users/' + name);
	};
	// return our entire userFactory object
	return User;
});
