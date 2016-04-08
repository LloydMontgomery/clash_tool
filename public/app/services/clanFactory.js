angular.module('clanFactory', []) 
.factory('Clan', function($http, $q) {
	// create a new object
	var clanFactory = {};

	

	/* STATIC FUNCTIONS */

	// GET Wars
	Clan.allWars = function(){ 
		var defer = $q.defer();

		$http.get('/api/wars/')
		.then(function(data) {
			var wars = data.data.data;

			var wars = Object.keys(wars).map(function(i) { return wars[i] });

			wars.sort(function(a, b) {
				return (a.start < b.start) ? 1 : (a.start > b.start) ? -1 : 0;
			});

			// for (var i = 0; i < wars.length; i++) {
			// 	wars[i].start = new Date(Number(vm.wars[i].start)); // Convert milliseconds to date object
			// };

			defer.resolve(wars);
		}, function(data) {


			defer.reject(data);
		});


		return defer.promise;
	};

	// GET Wars - Partially
	Clan.partial = function(clanRef) { 
		return $http.get('/api/partialClan/' + clanRef);
	};

	// get all wars, partially
	// warFactory.partial = function() { 
	// 	return $http.get('/api/partialWars/');
	// };

	/* PUBLIC FUNCTIONS	 */

	function Clan(start, size) {

	};

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


	// Create a Clan
	clanFactory.create = function(clanData) {
		return $http.post('/api/clans/', clanData);
	};
	// Find the clan with the given Reference
	clanFactory.find = function(clanRef) {
		return $http.get('/api/partialClan/' + clanRef);
	};
	// Join a clan
	clanFactory.join = function(ref) {
		return $http.put('/api/clans/join/' + ref);
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
	return Clan;
});