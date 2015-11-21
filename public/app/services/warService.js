angular.module('warService', []) 
.factory('War', function($http) {
	// create a new object
	var warFactory = {};
	// get a single war
	warFactory.get = function(id) { 
		return $http.get('/api/wars/' + id);
	};
	// get all wars
	warFactory.all = function() { 
		return $http.get('/api/wars/');
	};
	// create a war
	warFactory.create = function(warData) { 
		return $http.post('/api/wars/', warData);
	};
	// update a war
	warFactory.update = function(id, warData) { 
		return $http.put('/api/wars/' + id, warData);
	};
	// delete a war
	warFactory.delete = function(id) { 
		return $http.delete('/api/wars/' + id);
	};
	// return our entire warFactory object
	return warFactory;
});
