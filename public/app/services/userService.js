angular.module('userService', []) 
.factory('User', function($http) {
	// create a new object
	var userFactory = {};

	

	// get a single user profile
	userFactory.getProfile = function(username) { 
		return $http.get('api/users/profile/' + username);
		// return $http.get('http://clash.solutions/api/users/profile/' + username);
	};
	// set a single user profile
	userFactory.setProfile = function(username, userData) {
		console.log("Here!!!!!!");
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
	// create a user
	userFactory.create = function(userData) { 
		return $http.post('/api/users/', userData);
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
	return userFactory;
});
