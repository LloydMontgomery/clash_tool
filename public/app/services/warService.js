angular.module('warService', []) 
.factory('War', function($http) {
	// create a new object
	var warFactory = {};

	function War(start, size) {

    // Public properties, assigned to the instance ('this')
    this.start = start;
		this.opponent = "";
		this.size = size;
		this.inProgress = true;
		this.warriors = [
			// {
			// 	name : String,
			// 	thLvl : Number,
			// 	viewed : Boolean,
			// 	attack1 : String, - "Pick"
			// 	attack2 : String, - "Pick"
			// 	lock1 : Boolean,
			// 	lock2 : Boolean,
			// 	stars1 : Number, - 0, 1, 2, 3
			// 	stars1 : Number - 0, 1, 2, 3
			// }
		]; 
		// this.results : {
		// 	outcome : String - "war-win", "war-loss",
		// 	exp : Number,
		// 	ourScore : Number,
		// 	theirScore : Number,
		// 	ourDest : Number,
		// 	theirDest : Number
		// }
  }

	

	// get a single war
	warFactory.get = function(id) { 
		return $http.get('/api/wars/' + id);
	};
	// get all wars
	warFactory.partial = function() { 
		return $http.get('/api/partialWars/');
	};
	// get all wars
	warFactory.last = function() { 
		return $http.get('/api/lastWar/');
	};
	// get all wars
	War.all = function(){ 
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
	// upload a war photo to S3
	warFactory.upload = function(data) {
		return $http.get('/api/sign_s3?file_name=' + data.lastModifiedDate + '&file_type=' + data.type);
	};
	// return our entire warFactory object
	return War;
});
