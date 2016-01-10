angular.module('userService', []) 
.factory('User', function($https) {
	// create a new object
	var userFactory = {};

	// get a single user profile
	userFactory.getProfile = function(id) { 
		return $https.get('/api/users/profile/' + id);
	};
	// get a single user profile
	userFactory.setProfile = function(id, userData) {
		return $https.put('/api/users/profile/' + id, userData);
	};
	// get a single user
	userFactory.get = function(id) { 
		return $https.get('/api/users/' + id);
	};
	// get partial users
	userFactory.partial = function() { 
		return $https.get('/api/partialUsers/');
	};
	// get all users
	userFactory.all = function() { 
		return $https.get('/api/users/');
	};
	// create a user
	userFactory.create = function(userData) { 
		return $https.post('/api/users/', userData);
	};
	// update a user
	userFactory.update = function(id, userData) { 
		return $https.put('/api/users/' + id, userData);
	};
	// delete a user
	userFactory.delete = function(name) { 
		return $https.delete('/api/users/' + name);
	};
	// return our entire userFactory object
	return userFactory;
});
