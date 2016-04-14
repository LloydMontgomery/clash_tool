angular.module('userFactory', []) 
.factory('User', function($http) {
	// create a new object
	var userFactory = {};

	// Constructor
	function User(){
		// Create properties
	}

	User.prototype.create = function() {
		console.log("Creating a User");
		return $http.post('/api/users/', userData);
	};


	// v v v v v NOT DONE YET v v v v v

	// get a single user profile
	userFactory.getProfile = function(username) { 
		return $http.get('api/users/profile/' + username);
		// return $http.get('http://clash.solutions/api/users/profile/' + username);
	};
	// set a single user profile
	userFactory.setProfile = function(username, userData) {
		return $http.put('/api/users/profile/' + username, userData);
	};
	// get a single user
	userFactory.get = function(id) { 
		return $http.get('/api/users/' + id);
	};
	// get partial users
	userFactory.partial = function() { 
		return $http.get('/api/partialUsers/');
	};
	// get all users
	userFactory.all = function() { 
		return $http.get('/api/users/');
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
