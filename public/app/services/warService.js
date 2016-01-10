angular.module('warService', []) 
.factory('War', function($https) {
	// create a new object
	var warFactory = {};
	// get a single war
	warFactory.get = function(id) { 
		return $https.get('/api/wars/' + id);
	};
	// get all wars
	warFactory.partial = function() { 
		return $https.get('/api/partialWars/');
	};
	// get all wars
	warFactory.last = function() { 
		return $https.get('/api/lastWar/');
	};
	// get all wars
	warFactory.all = function() { 
		return $https.get('/api/wars/');
	};
	// create a war
	warFactory.create = function(warData) { 
		return $https.post('/api/wars/', warData);
	};
	// update a war
	warFactory.update = function(id, warData) { 
		return $https.put('/api/wars/' + id, warData);
	};
	// delete a war
	warFactory.delete = function(id) { 
		return $https.delete('/api/wars/' + id);
	};
	// upload a war photo to S3
	warFactory.upload = function(data) {
		return $https.get('/api/sign_s3?file_name=' + data.lastModifiedDate + '&file_type=' + data.type);
	};
	// return our entire warFactory object
	return warFactory;
});
