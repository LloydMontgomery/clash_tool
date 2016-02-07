angular.module('clanService', []) 
.factory('Clan', function($http) {
	// create a new object
	var clanFactory = {};
	// // get a single war
	// clanFactory.get = function(id) { 
	// 	return $http.get('/api/wars/' + id);
	// };
	// // get all wars
	// clanFactory.partial = function() { 
	// 	return $http.get('/api/partialWars/');
	// };
	// // get all wars
	// clanFactory.last = function() { 
	// 	return $http.get('/api/lastWar/');
	// };
	// // get all wars
	// clanFactory.all = function() { 
	// 	return $http.get('/api/wars/');
	// };
	// create a war
	clanFactory.create = function(clanData) { 
		return $http.post('/api/clans/', clanData);
	};
	// // update a war
	// clanFactory.update = function(id, warData) { 
	// 	return $http.put('/api/wars/' + id, warData);
	// };
	// // delete a war
	// clanFactory.delete = function(id) { 
	// 	return $http.delete('/api/wars/' + id);
	// };
	// // upload a war photo to S3
	// clanFactory.upload = function(data) {
	// 	return $http.get('/api/sign_s3?file_name=' + data.lastModifiedDate + '&file_type=' + data.type);
	// };
	// return our entire clanFactory object
	return clanFactory;
});